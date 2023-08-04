

class Solution:
    def lengthOfLastWord(self, s: str) -> int: 
        # word_array = s.split(' ')
        # return len(word_array[-1])
        i, length = len(s) - 1, 0

        while s[i] == " ":
            i -= 1
        while i >= 0 and s[i] != " ":
            length += 1
        return length

if __name__ == '__main__':
    obj = Solution()
    print(obj.lengthOfLastWord("Hello World"))
    print(obj.lengthOfLastWord("   fly me   to   the moon  "))
    # print(obj.lengthOfLastWord("Hello World"))

