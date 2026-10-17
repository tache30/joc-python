import json

from django.test import TestCase
from django.urls import reverse


class GameStatusTests(TestCase):
    def setUp(self):
        self.url = reverse("game_status")

    def test_game_state_is_initialized_and_saved_in_session(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["coins"], 200)
        self.assertEqual(response.json()["inventory"], [])
        self.assertEqual(response.json()["tradeItems"], [])

        response = self.client.get(self.url)

        self.assertEqual(response.json()["coins"], 200)
        self.assertIn("game_state", self.client.session)

    def test_opened_case_is_saved_in_session(self):
        response = self.client.post(
            self.url,
            data=json.dumps({"action": "open_case"}),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["coins"], 100)
        self.assertEqual(len(response.json()["inventory"]), 1)
        self.assertIn(
            response.json()["inventory"][0]["rarity"],
            {"COMMON", "RARE", "EPIC", "LEGENDARY", "MYTHIC"},
        )

        response = self.client.get(self.url)

        self.assertEqual(response.json()["coins"], 100)
        self.assertEqual(len(response.json()["inventory"]), 1)

    def test_moved_item_is_saved_in_trade_area(self):
        opened = self.client.post(
            self.url,
            data=json.dumps({"action": "open_case"}),
            content_type="application/json",
        ).json()
        item_id = opened["inventory"][0]["id"]

        response = self.client.post(
            self.url,
            data=json.dumps({"action": "move_to_trade", "itemId": item_id}),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["inventory"], [])
        self.assertEqual(response.json()["tradeItems"][0]["id"], item_id)

        response = self.client.get(self.url)

        self.assertEqual(response.json()["inventory"], [])
        self.assertEqual(response.json()["tradeItems"][0]["id"], item_id)

    def test_invalid_json_is_rejected(self):
        response = self.client.post(
            self.url,
            data="{invalid",
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
