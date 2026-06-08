/**
 * AI Tutor tab — conversational homework help.
 *
 * Sends messages to POST /ai (task: tutor_chat) and renders the response
 * in a chat bubble layout.  Designed to be clear and friendly for K-12.
 *
 * Note: This uses the non-streaming /ai endpoint.  Real-time streaming via
 * the SSE /ai/tutor/stream endpoint is a future enhancement.
 */

import React, { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/lib/auth';
import { aiApi } from '../../src/lib/api';
import { Heading } from '../../src/components/Typography';
import { Colors, FontSize, FontWeight, MIN_TOUCH_TARGET, Radius, Spacing } from '../../src/components/theme';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

const STARTER_PROMPTS = [
  'Explain fractions in simple words',
  'What caused World War I?',
  'Help me write a book report',
  'Solve: 3x + 7 = 22',
];

export default function TutorScreen() {
  const { token } = useAuth();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Hi! I'm your Mentora AI tutor. Ask me anything — maths, science, history, reading — and I'll explain it clearly. What would you like help with today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || !token || loading) return;

      const userMsg: Message = {
        id: `u-${Date.now()}`,
        role: 'user',
        text: text.trim(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setLoading(true);

      // Build context from the last 6 messages to keep tokens reasonable.
      const recentContext = [...messages, userMsg]
        .slice(-6)
        .map((m) => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.text}`)
        .join('\n');

      try {
        const res = await aiApi.invoke(token, {
          task: 'tutor_chat',
          prompt: text.trim(),
          context: recentContext,
        });
        const assistantMsg: Message = {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: res.result,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch {
        const errMsg: Message = {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: "Sorry, I couldn't process that right now. Please check your connection and try again.",
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setLoading(false);
        // Scroll to bottom after render.
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
      }
    },
    [token, messages, loading]
  );

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        {!isUser && <Text style={styles.bubbleLabel}>🤖 Tutor</Text>}
        <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <Heading level={2}>AI Tutor</Heading>
        <Text style={styles.headerSub}>Ask any homework question</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Message list */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          showsVerticalScrollIndicator={false}
          renderItem={renderMessage}
        />

        {/* Starter prompt chips */}
        {messages.length <= 1 && (
          <View style={styles.starters}>
            {STARTER_PROMPTS.map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => sendMessage(p)}
                accessible
                accessibilityRole="button"
                accessibilityLabel={`Try: ${p}`}
                style={styles.starter}
              >
                <Text style={styles.starterText}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Loading indicator */}
        {loading && (
          <View style={styles.typingRow}>
            <Text style={styles.typing}>Tutor is thinking…</Text>
          </View>
        )}

        {/* Input row */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask a question…"
            placeholderTextColor={Colors.textMuted}
            multiline
            accessibilityLabel="Your question"
            returnKeyType="send"
            onSubmitEditing={() => sendMessage(input)}
            editable={!loading}
          />
          <TouchableOpacity
            onPress={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Send message"
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  headerSub: { fontSize: FontSize.sm, color: Colors.textSecondary },
  messageList: {
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  bubble: {
    maxWidth: '85%',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.xs,
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
  },
  bubbleAssistant: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bubbleLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  bubbleText: {
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    lineHeight: FontSize.base * 1.55,
  },
  bubbleTextUser: { color: '#fff' },
  starters: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  starter: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: MIN_TOUCH_TARGET - 4,
    justifyContent: 'center',
  },
  starterText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
  typingRow: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  typing: { fontSize: FontSize.sm, color: Colors.textMuted, fontStyle: 'italic' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    maxHeight: 120,
    minHeight: MIN_TOUCH_TARGET,
  },
  sendBtn: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: Colors.border },
  sendIcon: { color: '#fff', fontSize: 18 },
});
