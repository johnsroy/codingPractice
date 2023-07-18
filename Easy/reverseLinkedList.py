# Definition for singly-linked list.
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
class Solution:
    def reverseListIterative(self, head: ListNode) -> ListNode:
        curr, prev = head, None

        while curr:
            nxt = curr.next
            curr.next = prev
            prev = curr
            curr = nxt #curr element moved to next element
        return prev
    

    def reverseListRecurssive(self, head: ListNode) -> ListNode:
        if not head:
            return None
        currHead = head

        if head: 
            currHead = self.reverseListRecurssive(head.next)
            head.next.next = head
        head.next = None
        return currHead

