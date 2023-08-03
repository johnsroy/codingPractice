

class Solution:
    def isUgly(self, n:int) -> bool:
        if n <= 0:
            return False
        
        for p in [2,3,5]:
            while n % p == 0:
                n = n // p

        return n == 1
    

if __name__ =='__main__':
    obj = Solution()
    print(obj.isUgly(20))