from collections import Counter
class Solution: 
    def isAnagramCounter(self, s:str, t:str) -> bool:
        return Counter(s) == Counter(t)
    
    def isAnagramSorted(self, s:str, t:str) -> bool:  # O(1) space o(nlogn) or o(n^2) based on sorting algo
        return sorted(s) == sorted(t)

    def isAnagram(self, s: str, t:str) -> bool: # O(s+t) space, o(s+t) time
        if len(s) != len(t):
            return False

        countS, countT = {},{}

        for i in range(len(s)):
            countS[s[i]] = 1 + countS.get(s[i], 0) #getting counts in 2 separate dicts
            countT[t[i]] = 1 + countT.get(t[i], 0)
        for c in countS:
            if countS[c] != countT.get(c,0): #comparing the two dicts for the 2 words
                return False
            
        # return True
    
if __name__ == '__main__':
    obj = Solution()
    word1 = "bat"
    word2 = "tab"
    print(obj.isAnagramSorted(word1,word2))
