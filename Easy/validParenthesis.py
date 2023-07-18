class Solution: 
    def isValid(self, s:str) -> bool:
        
        stack = []
        brackets = { '}' : '{', ']' : '[', ')' : '(' }

        for chars in s: 
            if chars in brackets:
                if stack and stack[-1] == brackets[chars]: 
                    stack.pop()
                else:
                    return False
            else:
                stack.append(chars)
        return True if not stack else False