from typing import List

class Solution: 
    def twoSum(self, nums:List[int], target:int) -> List[int]:
        prevMap = {} #value, index
        
        for i, n in enumerate(nums):
            diff = target - n
            if diff in prevMap:
                return [prevMap[diff],i]
            prevMap[n] = i
        return

if __name__ == '__main__':
    obj = Solution()
    print(obj.twoSum([2,3,1],4))


#until second element is found it will go to next line add diff as a previous element in the dict