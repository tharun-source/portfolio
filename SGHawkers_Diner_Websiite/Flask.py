from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
import shelve
from datetime import datetime, timedelta

from flask_socketio import SocketIO

from classes.user import User  # Import User class
from classes.address import Address  # Import Address class
from classes.hawker_centre import HawkerCentre  # Import HawkerCentre class
from classes.help import Help  # Import Help class
import re
import random
import requests


app = Flask(__name__)
app.secret_key = 'your_secret_key_here'
socketio = SocketIO(app, cors_allowed_origins="*")
HAWKER_APP_URL = "http://172.20.10.2:5050"  # Hawker App Base URL
SHELVE_DB_PATH = 'app_data'

hawker_centre = HawkerCentre()
help_system = Help()
STALLS = [
    {'id': 1, 'name': 'Famous Sungei Road Trishaw Laksa', 'image': 'images/stall1.jpg', 'centre': 'Maxwell Food Centre'},
    {'id': 2, 'name': 'Mw Fried Oyster Omlette', 'image': 'images/stall2.jpg', 'centre': 'Maxwell Food Centre'},
    {'id': 3, 'name': 'Mw Fuzhou Oyster Cake', 'image': 'images/stall3.jpg', 'centre': 'Maxwell Food Centre'},
    {'id': 4, 'name': 'My Chicken rice', 'image': 'images/stall4.jpg', 'centre': 'Maxwell Food Centre'},
    {'id': 5, 'name': 'Famous Noodles Stall', 'image': 'images/stall5.jpg','centre': 'Bedok Interchange Hawker Centre'},
    {'id': 6, 'name': 'Pastamania', 'image': 'images/stall6.jpg', 'centre': 'Bedok Interchange Hawker Centre'},
    {'id': 7, 'name': 'Fish Soup stall', 'image': 'images/stall9.jpg', 'centre': 'Chinatown Complex'},
    {'id': 8, 'name': 'Carrot Cake stall', 'image': 'images/stall10.jpg', 'centre': 'Chinatown Complex'},
    {'id': 9, 'name': 'Mw Fuzhou Oyster Cake', 'image': 'images/stall11.jpg','centre': 'Duncan Food Centre'},
    {'id': 10, 'name': 'Mw Fuzhou Oyster Cake', 'image': 'images/stall12.jpg', 'centre': 'Duncan Food Centre'},
    {'id': 11, 'name': 'Nasi Lemak Stall', 'image': 'images/stall13.jpg', 'centre': 'Old Airport Road Hawker Centre'},
    {'id': 12, 'name': 'Noodles Stall', 'image': 'images/stall14.jpg', 'centre': 'Old Airport Road Hawker Centre'},
]
food_items = [
    {"id": 1, "name": "Chicken Rice", "price": 4.50, "image": "chicken_rice.jpg"},
    {"id": 2, "name": "Laksa", "price": 5.00, "image": "laksa.jpg"},
    {"id": 3, "name": "Char Kway Teow", "price": 4.80, "image": "char_kway_teow.jpg"},
    {"id": 4, "name": "Spicy Dumplings", "price": 3.00, "image": "Dumplings-d.jpg"}
]

@socketio.on("order_status_update")
def handle_order_status_update(data):
    try:
        order_id = data.get("order_id")
        new_status = data.get("status")

        if not order_id or not new_status:
            return

        print(f"🚀 Received order update: {order_id} → {new_status}")
        with shelve.open('orders.db', writeback=True) as db:
            for username, orders in db.items():
                for order in orders:
                    if order["cust_id"] == order_id:
                        order["order_status"] = new_status
                        db[username] = orders  # Save updated data
                        break

        # 🔥 Emit update to clients
        socketio.emit("new_order", {"order_id": order_id, "status": "Unfulfilled"}, namespace="/")


    except Exception as e:
        print(f"❌ Error handling order status update:{e}")


@app.route('/')
def home():
    return render_template('home_page.html')


@app.route('/login', methods=['GET','POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        try:
            with shelve.open('users.db') as db:
                if username in db:
                    user = db[username]
                    if user.password == password:
                        session['username'] = username
                        return redirect(url_for('dashboard'))
                    else:
                        return render_template('login.html', error='Incorrect password')
                else:
                    return render_template('login.html', error = 'Username not found')
        except IOError:
            print('Cannot able to access users database')

    return render_template('login.html')
@app.route('/signup', methods=['GET','POST'])
def signup():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        if not re.match(r"^[a-zA-Z0-9_.-]{5,}$", username):
            return render_template('signup.html',error="Username must be at least 5 characters.")

        if not re.match(r"^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$", password):
            return render_template('signup.html',error="Password must be at least 8 characters long, a letter,number, and a special character.")

        try:
            with shelve.open('users.db') as db:
                if username in db:
                    return render_template('signup.html', error="Username already exists, please choose another.")
                else:
                    user = User(username, password)
                    db[username] = user
                    return redirect(url_for('login'))  # Redirect to login page
        except IOError:
            print('Cannot able to access users database')


    return render_template('signup.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

@app.route('/dashboard', methods=['GET', 'POST'])
def dashboard():
    username = session.get('username')
    if not username:
        return redirect(url_for('login'))

    user_address_key = f'{username}_addresses'

    with shelve.open('addresses.db', 'c') as db:
        address_list = db.get(user_address_key, [])  # Default to an empty list

        # Handle address selection
        if request.method == 'POST':
            selected_address = request.form.get('selected_address')
            session['selected_address'] = selected_address  # Store in session

    # Retrieve selected address from session
    selected_address = session.get('selected_address', "No address selected")
    current_time = datetime.now()
    orders = []
    with shelve.open('orders.db', 'c') as db:
        user_orders = db.get(username, [])

        # Filter out orders older than 1 hour
        updated_orders = []
        for order in user_orders:
            try:
                # Convert stored order time to datetime
                order_time = datetime.strptime(order['time'], "%Y-%m-%d %H:%M")
                scheduled_delivery_time = order_time + timedelta(minutes=30)  # Assume 30 min estimated delivery
                expiration_time = scheduled_delivery_time + timedelta(minutes=1)  # 1 minute buffer
                is_expired = current_time > expiration_time
                # Check if the order is past its cancellation threshold
                if is_expired and order["order_status"] not in ["Completed", "Cancelled"]:
                    order["order_status"] = "Cancelled"

                    # Only keep orders that are still valid (not older than 1 hour)
                if current_time - order_time < timedelta(hours=1):
                    updated_orders.append(order)

            except Exception as e:
                print(f"⚠️ Error processing order time: {e}")
                updated_orders.append(order)  # Keep order if there's a problem

                # ✅ Save the updated order list back to shelve
        db[username] = updated_orders

            # ✅ Prepare orders for the frontend
        for order in updated_orders:
            orders.append({
                "cust_id": order.get("cust_id"),
                "item_name": order.get("item_name", "Unknown"),
                "order_status": order.get("order_status", "Pending"),
                "show_cancel": order.get("order_status") not in ["Completed", "Cancelled"],
                })

    return render_template('dashboard.html', addresses=address_list, selected_address=selected_address, orders=user_orders)


@app.route('/feedback', methods=['GET', 'POST'])
def feedback():
    username = session.get('username')
    if not username:
        return redirect(url_for('login'))

    if request.method == 'POST':
        new_feedback = HawkerCentre(
            id=len(HawkerCentre.get_user_feedback(username)),
            cleanliness=request.form.get('cleanliness'),
            customization=request.form.get('customization'),
            delivery=request.form.get('delivery'),
            food_quality=request.form.get('food_quality'),
            eco_friendly=request.form.get('eco_friendly'),
            additional_feedback=request.form.get('additional_feedback')
        )

        HawkerCentre.save_user_feedback(username,new_feedback)
        # ✅ Notify the admin website
        admin_url = "http://127.0.0.1:1221/receive_feedback"  # Admin server URL
        try:
            response = requests.post(admin_url, json=new_feedback)
            if response.status_code == 200:
                print("✅ Admin notified successfully!")
            else:
                print("⚠️ Failed to notify admin. Error:", response.text)
        except requests.exceptions.RequestException as e:
            print("❌ Could not connect to admin site:", e)


        return redirect(url_for('feedback_validation'))



    feedback_list = HawkerCentre.get_user_feedback(username)
    return render_template('feedback.html', feedback_list=feedback_list)

@app.route('/edit_feedback/<int:feedback_id>', methods=['GET', 'POST'])
def edit_feedback(feedback_id):
    username = session.get('username')
    if not username:
        return redirect(url_for('login'))

    feedback_list = HawkerCentre.get_user_feedback(username)
    feedback_to_edit = next((f for f in feedback_list if f.id == feedback_id), None)

    if not feedback_to_edit:
        return "Feedback not found", 404

    if request.method == 'POST':
        feedback_to_edit.cleanliness = request.form.get('cleanliness')
        feedback_to_edit.customization = request.form.get('customization')
        feedback_to_edit.delivery = request.form.get('delivery')
        feedback_to_edit.food_quality = request.form.get('food_quality')
        feedback_to_edit.eco_friendly = request.form.get('eco_friendly')
        feedback_to_edit.additional_feedback = request.form.get('additional_feedback')
        HawkerCentre.update_user_feedback(username, feedback_to_edit)
        return redirect(url_for('view_feedback'))

    return render_template('feedback.html', feedback=feedback_to_edit)


@app.route('/view_feedback', methods=['GET'])
def view_feedback():
    username = session.get('username')
    if not username:
        return redirect(url_for('login'))
    with shelve.open('hawker_feedback.db', 'c') as db:
        user_feedback_key = f"{username}_feedback"
        feedback_list = db.get(user_feedback_key, []) #the default has nothing to ensure hta the route works even if the feedback list is empty
        print(feedback_list)
    return render_template('view_feedback.html', feedback_list=feedback_list)

@app.route('/delete_feedback/<int:feedback_id>', methods=['POST'])
def delete_feedback(feedback_id):
    username = session.get('username')
    if not username:
        return redirect(url_for('login'))

    HawkerCentre.delete_user_feedback(username, feedback_id)
    return redirect(url_for('view_feedback'))


@app.route('/feedback_validation')
def feedback_validation():
    return render_template('feedback_validation.html')


@app.route('/submit_feedback', methods=['POST'])
def submit_feedback():
    username = session.get('username', 'Anonymous')  # Get username, default to 'Anonymous'

    # ✅ Get form data
    feedback_data = {
        "cleanliness": request.form.get("cleanliness"),
        "customization": request.form.get("customization"),
        "delivery": request.form.get("delivery"),
        "food_quality": request.form.get("food_quality"),
        "eco_friendly": request.form.get("eco_friendly"),
        "additional_feedback": request.form.get("additional_feedback"),
        "user": username,
        "time": datetime.now().strftime('%Y-%m-%d %I:%M %p')
    }

    # ✅ Store feedback locally (Shelve database)
    with shelve.open('feedbacks.db', writeback=True) as db:
        feedback_list = db.get("feedbacks", [])
        feedback_list.append(feedback_data)
        db["feedbacks"] = feedback_list

    # ✅ Send feedback to the Admin Site
    admin_feedback_url = "http://172.20.10.2:5050/receive_feedback"
    try:
        response = requests.post(admin_feedback_url, json=feedback_data)
        if response.status_code == 200:
            print("✅ Feedback sent to admin successfully")
        else:
            print("❌ Failed to send feedback to admin")
    except requests.exceptions.RequestException as e:
        print(f"⚠️ Error connecting to admin site: {e}")

    flash("Thank you for your feedback!", "success")
    return redirect(url_for('feedback'))


@app.route('/address', methods=['GET', 'POST'])
def address():
    username = session.get('username')
    if not username:
        return redirect(url_for('login'))

    next_page = request.args.get('next')

    if request.method == 'POST':
        new_address = Address(
            id=len(Address.get_user_addresses(username)) + 1,
            street=request.form.get('street'),
            block=request.form.get('block'),
            unit=request.form.get('unit'),
            postal_code=request.form.get('postal_code')
        )
        Address.save_user_address(username, new_address)

        # Redirect user back to checkout if they came from there
        if next_page:
            return redirect(next_page)
        return redirect(url_for('address'))  # Default redirect to address page

    address_list = Address.get_user_addresses(username)
    return render_template('address.html', address_list=address_list, next_page=next_page)

# Route to delete an address by its ID
@app.route('/delete_address/<int:address_id>', methods=['POST'])
def delete_address(address_id):
    username = session.get('username')
    if not username:
        return redirect(url_for('login'))

    user_address_key= f"{username}_addresses"
    with shelve.open('addresses.db','c') as db:
        if user_address_key in db:
            addresses = db[user_address_key]
            addresses = [a for a in addresses if a['id'] !=address_id]
            db[user_address_key] = addresses


    return redirect(url_for('address'))

@app.route('/edit_address/<int:address_id>', methods=['GET', 'POST'])
def edit_address(address_id):
    username = session.get('username')
    if not username:
        return redirect(url_for('login'))

    address_list = Address.get_user_addresses(username)
    address_to_edit = next((a for a in address_list if a.id == address_id), None)

    if not address_to_edit:
        return "Address not found", 404

    if request.method == 'POST':
        address_to_edit.street = request.form.get('street')
        address_to_edit.block = request.form.get('block')
        address_to_edit.unit = request.form.get('unit')
        address_to_edit.postal_code = request.form.get('postal_code')
        Address.update_user_address(username, address_to_edit)
        return redirect(url_for('address'))

    return render_template('edit_address.html', address=address_to_edit)


@app.route('/help', methods=['GET', 'POST'])
def help_page():
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        issue = request.form.get('issue')

        # Add the support request
        help_system.add_support_request(name, email, issue)
        return redirect(url_for('help_validation'))

    faqs = help_system.get_faqs()
    return render_template('help.html', faqs=faqs)


@app.route('/help_validation')
def help_validation():
    return render_template('help_validation.html')


@app.route('/menu_selection/<centre>')
def menu_selection(centre):
    stalls = [stall for stall in STALLS if stall["centre"] == centre]
    return render_template("stall_selection.html", stalls=stalls, hawker_centre=centre)


@app.route('/stall_selection/<hawker_centre>', methods=['GET'])
def stall_selection(hawker_centre):
    session['last_hawker_centre'] = hawker_centre  #  Save last selected hawker centre
    page = int(request.args.get('page', 1))  # Current page number (default: 1)
    stalls_per_page = 2  # Number of stalls per page

    # Filter stalls by hawker center
    filtered_stalls = [stall for stall in STALLS if stall['centre'] == hawker_centre]

    # Pagination logic
    start = (page - 1) * stalls_per_page
    end = start + stalls_per_page
    stalls = filtered_stalls[start:end]

    next_page = len(filtered_stalls) > end  # Check if there is a next page

    return render_template(
        'stall_selection.html',
        hawker_centre=hawker_centre,
        stalls=stalls,
        page=page,
        next_page=next_page
    )

@app.route('/food_selection/<int:stall_id>')
def food_selection(stall_id):
    dishes = fetch_food_items(stall_id)  # Fetch food items based on the stall ID
    hawker_centre = session.get('last_hawker_centre', None)  # Retrieve last hawker centre
    print(f"Dishes for Stall {stall_id}: {dishes}")  # Debugging line
    return render_template('menu_selection.html', dishes=dishes, stall_id=stall_id, hawker_centre=hawker_centre)


def fetch_food_items(stall_id):
    with shelve.open('food_menu.db', 'r') as db:
        return db.get(str(stall_id), [])  # Ensure it returns a list

@app.route('/add_to_cart/<int:food_id>/<int:stall_id>', methods=['POST'])
def add_to_cart(food_id,stall_id):
    if 'cart' not in session:
        session['cart'] = []

    with shelve.open('food_menu.db', 'r') as db:
        food_items = db.get(str(stall_id), [])

    # Find food item by ID
    selected_food = next((food for food in food_items if food["id"] == food_id), None)

    if selected_food:
        session['cart'].append(selected_food)
        session.modified = True  # Save session changes
        flash(f"Added {selected_food['name']} to cart!", "success")
    return redirect(url_for('food_selection', stall_id=stall_id))

# View Cart Page
@app.route('/cart')
def view_cart():
    cart_items = session.get('cart', [])
    total_price = sum(item['price'] for item in cart_items)
    return render_template('cart.html', cart_items=cart_items, total_price=total_price)

# Remove Item from Cart
@app.route('/remove_from_cart/<int:food_id>', methods=['POST'])
def remove_from_cart(food_id):
    if 'cart' in session:
        session['cart'] = [item for item in session['cart'] if item['id'] != food_id]
        session.modified = True  # Save session changes

    return redirect(url_for('view_cart'))

@app.route('/checkout', methods=['GET', 'POST'])
def checkout():
    username = session.get('username')
    if not username:
        return redirect(url_for('login'))  # Redirect if not logged in

    cart_items = session.get('cart', [])
    total_price = sum(item['price'] for item in cart_items)
    current_year_month = datetime.now().strftime('%Y-%m')

    with shelve.open('addresses.db', 'c') as db:
        user_address_key = f"{username}_addresses"
        user_addresses = db.get(user_address_key, [])  # Fetch user's saved addresses

    selected_address = None

    if request.method == 'POST':
        selected_address_id = request.form.get('selected_address')
        selected_address = next((addr for addr in user_addresses if str(addr['id']) == selected_address_id), None)

        if selected_address:
            session['selected_address'] = selected_address
            return redirect(url_for('process_payment', selected_address_id=selected_address_id))
        flash("Please select a valid address.", "warning")


    return render_template('checkout.html', cart_items=cart_items, total_price=total_price,current_year_month=current_year_month,addresses=user_addresses)

# Extract unique hawker centres
def get_unique_hawker_centres():
    return list(set(stall['centre'] for stall in STALLS))

# Store hawker centres in shelve
def save_hawker_centres():
    with shelve.open('hawker_centres.db', 'c') as db:
        db['centres'] = get_unique_hawker_centres()

# Run this function **once** to populate the database
save_hawker_centres()


@app.route('/process_payment', methods=['POST'])
def process_payment():
    username = session.get('username')
    if not username:
        return redirect(url_for('login'))  # Redirect if not logged in

    # ✅ Validate Form Inputs
    name = request.form.get('name')
    card_number = request.form.get('card_number')
    expiry = request.form.get('expiry')
    cvv = request.form.get('cvv')
    order_type = request.form.get('order_type')  # Delivery or Pickup
    personal_request = request.form.get('personal_request', "None")
    selected_address_id = request.form.get('selected_address')  # Only for Delivery orders

    if not all([name, card_number, expiry, cvv, order_type]):
        flash("All fields are required!", "danger")
        return redirect(url_for('checkout'))

    estimated_delivery_time = (datetime.now() + timedelta(minutes=30)).strftime('%I:%M %p')

    # ✅ Get cart items from session
    cart_items = session.get('cart', [])
    if not cart_items:
        flash("Your cart is empty!", "warning")
        return redirect(url_for('view_cart'))

    # ✅ Calculate total price
    total_price = sum(item['price'] for item in cart_items)

    # ✅ Handle Selected Address (Only for Delivery)
    selected_address = "No address selected"
    if order_type == 'Delivery':
        if not selected_address_id:
            flash("Please select a delivery address!", "warning")
            return redirect(url_for('checkout'))

        try:
            selected_address_id = int(selected_address_id)  # Ensure it’s an integer
        except ValueError:
            flash("Invalid address selection!", "danger")
            return redirect(url_for('checkout'))

        # ✅ Retrieve the Address from `shelve`
        with shelve.open('addresses.db', 'r') as db:
            user_address_key = f"{username}_addresses"
            user_addresses = db.get(user_address_key, [])
            selected_address = next(
                (addr for addr in user_addresses if addr['id'] == selected_address_id), None
            )

        if not selected_address:
            flash("Selected address not found!", "warning")
            return redirect(url_for('checkout'))

    order_id = f"#ORD{int(datetime.now().timestamp() * 1000)}-{random.randint(100, 999)}"

    # ✅ Format Orders for Storage & Sending
    formatted_orders = [
        {
            "cust_id": order_id,
            "item_name": item["name"],
            "personal_request": personal_request,
            "payment_mode": "App (P)" if order_type == "Pickup" else "App (D)",
            "payment_status": "Paid" if order_type == 'Pickup' else "Pending",
            "order_status": "Unfulfilled" if order_type == 'Delivery' else "Ready for Pickup",
            "time": datetime.now().strftime("%Y-%m-%d %H:%M"),  # ✅ Stores full date and time,
            "order_type": order_type
        }
        for item in cart_items
    ]

    # ✅ Store Orders Locally in `shelve`
    with shelve.open('orders.db', 'c') as db:
        user_orders = db.get(username, [])
        if not isinstance(user_orders, list):
            user_orders = []  # Ensure it's a list

        user_orders.extend(formatted_orders)  # ✅ Append all new orders
        db[username] = user_orders  # ✅ Save back to database

    # ✅ Determine the correct URL for sending orders
    admin_base_url = 'http://172.20.10.2:5050'
    admin_url = f"{admin_base_url}/receive_delivery_order" if order_type == "Delivery" else f"{admin_base_url}/new_orders_update"

    # ✅ Send each food item as a separate request to the Hawker App
    for order in formatted_orders:
        try:
            response = requests.post(admin_url, json=order)
            if response.status_code != 200:
                flash(f"Error sending order to Hawker: {response.text}", "error")
        except requests.exceptions.RequestException as e:
            flash(f"Error connecting to Hawker App: {e}", "danger")

        # ✅ Emit WebSocket Event for Real-Time Order Updates (Fixed)
    socketio.emit("new_order", {"order_id": order_id, "status": "Unfulfilled"}, namespace="/")

    # ✅ Clear Cart and Redirect to Success Page
    session.pop('cart', None)
    return render_template('payment_success.html', total_price=total_price, delivery_time=estimated_delivery_time)
@app.route('/order_history')
def order_history():
    username = session.get('username')
    if not username:
        return redirect(url_for('login'))  # Redirect if not logged in

    # Fetch the user's past orders
    with shelve.open('orders.db', 'c') as db:
        user_orders = db.get(username, [])

        print("Type of user_orders:", type(user_orders))  # Debugging Output
        print("Value of user_orders:", user_orders)
        updated_orders = []
        for order in user_orders:
            if 'items' not in order or not isinstance(user_orders, list):  # Fix if it's not a list
                order['items'] = []

            if 'total_price' not in order:
                order['total_price'] = sum(item.get('price', 0) for item in order['items'])  # Calculate total

            updated_orders.append(order)

    return render_template('order_history.html', orders=updated_orders)

@app.route("/cancel_order/<order_id>", methods=["POST"])
def cancel_order(order_id):
    data = request.get_json()
    reason = data.get("cancel_reason", "No reason provided")

    with shelve.open(SHELVE_DB_PATH, writeback=True) as db:
        app_data = db.get("AppData", {})
        orders = app_data.setdefault("Orders", {"pending": {}, "completed": {}, "cancellation": {}, "refunds": {}})

        # 🟢 Check if the order exists in pending orders
        if order_id in orders.get("pending", {}):
            item_name = orders["pending"][order_id].get("item_name", "Unknown")  # Get item name
            orders["pending"].pop(order_id)  # Remove from pending orders
            orders["cancellation"][order_id] = {"reason": reason, "status": "Cancelled", "item_name": item_name}

            # 🟢 Update Recent Activities
            dashboard = app_data.setdefault("Dashboard", {})
            recent_activities = dashboard.setdefault("RecentActivities", [])
            recent_activities.append({
                "order_id": order_id,
                "item_name": item_name,
                "status": "Cancelled",
                "status_color": "danger",
                "reason": reason
            })
            dashboard["RecentActivities"] = recent_activities[-10:]  # Keep only the last 10

            db["AppData"] = app_data  # Save changes

    # 🟢 Emit WebSocket event to update the Hawker Dashboard in real-time
    socketio.emit("order_cancelled", {"order_id": order_id, "item_name": item_name, "reason": reason})

    return jsonify({"success": True, "message": f"Order {order_id} cancelled successfully!"})



@app.route("/current-url", methods=["GET"])
def current_url():
    return {"url": request.host_url}


@app.route("/admin-login")
def admin_login():
    try:
        # 🔹 Replace this with your friend's ngrok/public IP
        admin_url = "http://172.20.10.2:5050/"  # Your friend's IP and port

        # 🔹 Redirect directly to the admin site
        return redirect(admin_url)

    except requests.exceptions.RequestException:
        flash("Admin website is not accessible. Try again later.", "danger")
        return redirect(url_for('login'))


if __name__ == '__main__':
    socketio.run(app,port=5000,debug=True, allow_unsafe_werkzeug=True)
