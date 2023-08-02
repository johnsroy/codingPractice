# LeetCode 26

from typing import List

class Solution:
    def removeDupes(self, nums: List[int]) -> int:
        l = 1

        for r in range (1, len(nums)):
            if nums[r] != nums[r-1]:
                nums[l] = nums[r]
                l += 1
        return l


if __name__ == '__main__':
    obj = Solution()
    print(obj.removeDupes([0,0,1,1,1,2,2,3,3,4]))
