from typing import List

class Solution:
    def replaceElements(self, arr:List[int]) -> List[int]:
        #initialize max to -1
        # itereate the array backwards
        # newMax = max (oldmax, arr[i])

        rightMax = -1
        for i in range(len(arr) -1, -1, -1):
            newMax= max(rightMax, arr[i])
            arr[i] = rightMax
            rightMax = newMax

        return arr
