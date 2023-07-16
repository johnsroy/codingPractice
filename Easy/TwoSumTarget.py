from typing import List

class Solution:
    def twoSum(self, nums: List[int], target:int) -> List[int]:
        l,r = 0, len(nums) -1
        currSum = 0

        while l < r:
            currSum = nums[l] + nums[r]

            if currSum < target: 
                l +=1
            elif currSum > target: 
                r -=1
            else:
                return [l+1, r+1]
        return
    

if __name__ == '__main__':
    obj = Solution()
    print(obj.twoSum([2,7,11,15],9))
    print(obj.twoSum([2,3,4],6))
    print(obj.twoSum([-1,0],-1))
