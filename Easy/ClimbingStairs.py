class Solution:
    def climbStairs(self, n: int) -> int:
        one, two = 1,1 #n is number of steps

        for i in range(n-1):
            temp = one
            one = one + two
            two = temp

        return one
    
if __name__ == '__main__':
    obj = Solution()
    print(obj.climbStairs(3))