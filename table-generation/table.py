import requests
from collections import Counter
from itertools import product, chain

alphabet = "1234567"
def valid_string(string):
    counts = Counter(string)
    if any(counts[a] > 6 for a in alphabet):
        return False;

    bitboard = [0, 0]
    moves = []
    heights = [i * (6 + 1) for i in range(7)]
    def currentTurn():
        return len(moves) & 1
    def isValidMove(col):
        top_mask = 0b1000000100000010000001000000100000010000001000000;
        return (top_mask & (1 << heights[col])) == 0
    def isWin(piece):
        b = bitboard[piece]
        return any((b & (b >> x) & (b >> (2 * x)) & (b >> (3 * x))) != 0 for x in [1, 6, 7, 8])
    def isDraw():
        return len(moves) == 42
    def isGameOver():
        return isWin(0) or isWin(1) or isDraw()
    def makeMove(col):
        if not isValidMove(col):
            print("sometihng not right")
            return false
        move = 1 << heights[col]
        heights[col] += 1
        bitboard[currentTurn()] ^= move
        moves.append(col)
    for i in string:
        makeMove(int(i) - 1)
    return not isGameOver();

comb = chain.from_iterable(filter(valid_string, map(lambda x : "".join(x), product(alphabet, repeat = i))) for i in range(6, 7)) # next is 7, 8

for string in comb:
    # print(string)
    url = "https://connect4.gamesolver.org/solve?pos=" + string
    headers = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36"}
    score = requests.get(url, headers = headers).json()["score"]
    hi = max(score)
    score = map(lambda x: -1 if x == 100 else x, score)
    indices = [str(i) for i in map(lambda x: x if score[x] == hi else -1, range(len(score))) if i != -1]
    print('"' + string + '":' + str(indices) + ",")
print("}")
