
# Definition for singly-linked list.
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


class Solution:
    def isPalindrome_Array(self, head: ListNode) -> bool:
        nums = []

        while head:
            nums.append(head.val)
            head = head.next

        l, r = 0, len(nums) - 1
        while l < r:
            if nums[l] != nums[r]:
                return False
            l += 1
            r -= 1
        return True

    def isPalindrome_LL(self, head:ListNode) -> bool:
        slow, fast = head, head

        #compute slow and faster pointers
        while fast and fast.next:
            fast = fast.next.next
            slow = slow.next

        prev = None
        #reverse slow LL
        while slow:
            tmp = slow.next
            slow.next = prev
            prev = slow
            slow = tmp

        left, right = head, prev
        #compare numbers
        while right:
            if left.val != right.val:
                return False
            left = left.next
            right = right.next
            
        return True

