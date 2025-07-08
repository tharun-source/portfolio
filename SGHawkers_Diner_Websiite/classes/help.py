class Help:
    def __init__(self):
        self.faqs = [
            {"question": "How do I place an order?", "answer": "You can place an order by selecting a hawker center and choosing your items."},
            {"question": "Can I edit my order?", "answer": "Yes, you can edit your order before checkout."},
            {"question": "What payment methods are accepted?", "answer": "We accept credit cards, PayNow, and e-wallets."},
        ]
        self.support_requests = []

    def get_faqs(self):
        return self.faqs

    def add_support_request(self, name, email, issue):
        self.support_requests.append({"name": name, "email": email, "issue": issue})


