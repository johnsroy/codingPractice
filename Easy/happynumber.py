class Solution:
    def isHappy(self, n: int) -> bool:
        visit = set()

        while n:
            visit.add(n)
            n = self.sumofSquares(n)

            if n==1:
                return True
        return False


    def sumofSquares (self, n:int) -> int:
        output = 0

        while n:
            digit = n % 10
            digit = digit ** 2
            output += digit
            n = n // 10
        return output


if __name__ == '__main__':
    obj = Solution()
    print(obj.isHappy(19))
    # print(obj.isHappy(18))
    # print(obj.isHappy(2))
