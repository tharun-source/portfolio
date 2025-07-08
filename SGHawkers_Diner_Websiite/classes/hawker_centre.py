import shelve
class HawkerCentre:
    def __init__(self, id=0, cleanliness=0, customization=0, delivery=0, food_quality=0, eco_friendly=0, additional_feedback=""):
        self.id = id
        self.cleanliness = cleanliness
        self.customization = customization
        self.delivery = delivery
        self.food_quality = food_quality
        self.eco_friendly = eco_friendly
        self.additional_feedback = additional_feedback

    def to_dict(self):
        return {
            'id': self.id,
            'cleanliness': self.cleanliness,
            'customization': self.customization,
            'delivery': self.delivery,
            'food_quality': self.food_quality,
            'eco_friendly': self.eco_friendly,
            'additional_feedback': self.additional_feedback
        }

    @staticmethod
    def get_user_feedback(username):
        user_feedback_key = f"{username}_feedback"
        with shelve.open('hawker_feedback.db', 'c') as db:
            return [HawkerCentre(**fb) for fb in db.get(user_feedback_key, [])]

    @staticmethod
    def save_user_feedback(username, new_feedback):
        user_feedback_key = f"{username}_feedback"
        with shelve.open('hawker_feedback.db', 'c') as db:
            feedback_list = db.get(user_feedback_key, [])
            feedback_list.append(new_feedback.to_dict())
            db[user_feedback_key] = feedback_list

    @staticmethod
    def update_user_feedback(username, updated_feedback):
        user_feedback_key = f"{username}_feedback"
        with shelve.open('hawker_feedback.db', 'c') as db:
            feedback_list = db.get(user_feedback_key, [])
            for feedback in feedback_list:
                if feedback['id'] == updated_feedback.id:
                    feedback.update(updated_feedback.to_dict())
            db[user_feedback_key] = feedback_list

    @staticmethod
    def delete_user_feedback(username, feedback_id):
        user_feedback_key = f"{username}_feedback"
        with shelve.open('hawker_feedback.db', 'c') as db:
            feedback_list = db.get(user_feedback_key, [])
            feedback_list = [fb for fb in feedback_list if fb['id'] != feedback_id]
            db[user_feedback_key] = feedback_list
