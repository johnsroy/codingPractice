from typing import List

class Solution:
    def maxSubArray(self, nums:List[int]) -> int:
        maxSubArr = nums[0]
        currSum = 0

        for n in nums:
            if currSum < 0:
                currSum = 0
            currSum = currSum + n

            maxSubArr = max(currSum, maxSubArr)

        return maxSubArr
    
if __name__ == '__main__':
    obj = Solution()
    print(obj.maxSubArray([-2,1,-3,4,-1,2,1,-5,4]))

