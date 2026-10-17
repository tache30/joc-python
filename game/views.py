import json
import random

from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods


INITIAL_COINS = 200
CASE_PRICE = 100
GAME_SESSION_KEY = "game_state"
RARITIES = ("COMMON", "RARE", "EPIC", "LEGENDARY", "MYTHIC")


def _get_game_state(request):
    return request.session.get(
        GAME_SESSION_KEY,
        {
            "coins": INITIAL_COINS,
            "inventory": [],
            "tradeItems": [],
            "nextItemId": 0,
        },
    )


def _game_response(state, status=200, **extra):
    return JsonResponse({**state, **extra}, status=status)


@ensure_csrf_cookie
@require_http_methods(["GET", "POST"])
def game_status(request):
    state = _get_game_state(request)

    if request.method == "GET":
        request.session[GAME_SESSION_KEY] = state
        return _game_response(state, message="Jocul este conectat la Django!")

    try:
        payload = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Corpul cererii nu conține JSON valid."}, status=400)

    if not isinstance(payload, dict):
        return JsonResponse({"error": "Corpul cererii trebuie să fie un obiect JSON."}, status=400)

    action = payload.get("action")

    if action == "open_case":
        if state["coins"] < CASE_PRICE:
            return _game_response(state, status=409, error="Nu ai destui bani!")

        state["coins"] -= CASE_PRICE
        state["inventory"].append(
            {
                "id": state["nextItemId"],
                "rarity": random.choice(RARITIES),
            }
        )
        state["nextItemId"] += 1
        message = f"Ai primit: {state['inventory'][-1]['rarity']}"
    elif action == "move_to_trade":
        item_id = payload.get("itemId")
        if isinstance(item_id, bool) or not isinstance(item_id, int):
            return JsonResponse({"error": "ID-ul obiectului nu este valid."}, status=400)

        item = next(
            (item for item in state["inventory"] if item["id"] == item_id),
            None,
        )
        if item is None:
            return _game_response(
                state,
                status=409,
                error="Obiectul nu mai este în inventar.",
            )

        state["inventory"] = [
            inventory_item
            for inventory_item in state["inventory"]
            if inventory_item["id"] != item_id
        ]
        state["tradeItems"].append(item)
        message = "Obiectul a fost adăugat în zona de trade."
    else:
        return JsonResponse({"error": "Acțiunea nu este recunoscută."}, status=400)

    request.session[GAME_SESSION_KEY] = state
    return _game_response(state, message=message)
