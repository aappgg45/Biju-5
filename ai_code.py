import json
import random
class ChatBot:
    def __init__(self, data_file):
        with open(data_file, 'r', encoding='utf-8') as file:
            self.data = json.load(file)
    def process_input(self, user_input):
        user_input = user_input.lower()
        best_match_score = 0
        best_response = None
        for conversation in self.data['conversations']:
            match_score = 0
            for keyword in conversation['keywords']:
                if keyword in user_input:
                    match_score += 1
            if match_score > best_match_score:
                best_match_score = match_score
                best_response = conversation['responses']
        if best_match_score == 0 or best_response is None:
            return random.choice(self.data['default_response'])
        else:
            return random.choice(best_response)
    def get_response(self, user_input):
        return self.process_input(user_input)
إنشاء كائن من الروبوت
bot = ChatBot('data.json')
دالة لإرجاع الرد
def get_bot_response(user_input):
    return bot.get_response(user_input)