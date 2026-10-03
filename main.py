import random
coins = 200
print(coins)
case_price = 100
alegere = input("\nCe vrei sa faci?\n1. Deschide o cutie\n2. Inventar\n")
if alegere == "1":
    if coins >= case_price:
        print("primesti o cutie")
        coins -= case_price
        numar = random.randint(1, 100)
        if numar <= 60:
            print("Ai primit: COMMON")

        elif numar <= 85:
            print("Ai primit: RARE")

        elif numar <= 95:
            print("Ai primit: EPIC")

        elif numar <= 99:
            print("Ai primit: LEGENDARY")

        else:
            print("Ai primit: MYTHIC")
        print("mai ai", coins)

    else:
        print("mai ai nevoie de bani")


elif alegere == "2":
    print("vezi inventarul")
else:
    print("nu exista")
