import shelve

class Address:
    def __init__(self, id, street, block, unit, postal_code):
        self.id = id
        self.street = street
        self.block = block
        self.unit = unit
        self.postal_code = postal_code

    def to_dict(self):
        return {
            'id': self.id,
            'street': self.street,
            'block': self.block,
            'unit': self.unit,
            'postal_code': self.postal_code
        }

    @staticmethod
    def get_user_addresses(username):
        user_address_key = f"{username}_addresses"
        with shelve.open('addresses.db', 'c') as db:
            return [Address(**addr) for addr in db.get(user_address_key, [])]

    @staticmethod
    def save_user_address(username, new_address):
        user_address_key = f"{username}_addresses"
        with shelve.open('addresses.db', 'c') as db:
            address_list = db.get(user_address_key, [])
            address_list.append(new_address.to_dict())
            db[user_address_key] = address_list

    @staticmethod
    def update_user_address(username, updated_address):
        user_address_key = f"{username}_addresses"
        with shelve.open('addresses.db', 'c') as db:
            address_list = db.get(user_address_key, [])
            for address in address_list:
                if address['id'] == updated_address.id:
                    address.update(updated_address.to_dict())
            db[user_address_key] = address_list

    @staticmethod
    def delete_user_address(username, address_id):
        user_address_key = f"{username}_addresses"
        with shelve.open('addresses.db', 'c') as db:
            address_list = db.get(user_address_key, [])
            address_list = [addr for addr in address_list if addr['id'] != address_id]
            db[user_address_key] = address_list
