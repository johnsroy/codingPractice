from typing import List

class Solution:
    def rob(self, nums: List[int]) -> int:
        rob1, rob2 = 0,0

        #[rob1, rob2, num, num+1, ....]
        for num in nums: 
            temp = max(rob1+num, rob2)
            rob1 = rob2
            rob2 = temp

        return rob2

if __name__ == '__main__':
    obj = Solution()
    print(obj.rob([1,2,3,1]))
