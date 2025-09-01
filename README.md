# vibe-coding-345

```markdown
# AI StudyBuddy

AI StudyBuddy is a full-stack web application that helps students generate flashcards from their notes using AI. It combines a simple frontend, a Flask backend, a MySQL database, and the Hugging Face Inference API to provide an interactive study assistant.

---

## 🚀 Project Overview

- **Frontend**: Vanilla HTML5, CSS3 (with animations), and JavaScript.
- **Backend**: Python (Flask framework).
- **Database**: MySQL for storing users, chat history, and flashcards.
- **AI Service**: Hugging Face Inference API for generating flashcards.
- **Payments**: Freemium model with daily limits. Payment upgrade handled via inquiry form (M-Pesa, Airtel Money, etc.).

---

## 📂 Project Structure

```

AI-StudyBuddy/
├── app.py                # Main Flask backend
├── requirements.txt      # Python dependencies
├── schema.sql            # Database schema
├── README.md             # Project documentation
├── templates/            # HTML templates
│   ├── register.html
│   ├── login.html
│   ├── dashboard.html
│   ├── view\_set.html
│   └── upgrade.html
└── static/               # Static assets
├── css/
│   └── style.css
└── js/
└── flashcards.js

````

---

## ⚙️ Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/ai-studybuddy.git
cd ai-studybuddy
````

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file and add:

```
FLASK_SECRET_KEY=your_secret_key_here
HUGGINGFACE_API_KEY=your_hf_api_key_here
MYSQL_USER=your_mysql_user
MYSQL_PASSWORD=your_mysql_password
MYSQL_DB=ai_studybuddy
MYSQL_HOST=localhost
```

### 4. Initialize Database

Run the SQL schema file:

```bash
mysql -u your_mysql_user -p ai_studybuddy < schema.sql
```

### 5. Run the Flask App

```bash
flask run
```

Navigate to: [http://localhost:5000](http://localhost:5000)

---

## 🔐 Features

* Secure user authentication (hashing, sessions, last\_login tracking).
* Dashboard to generate flashcards and view chat history.
* Hugging Face API integration for automatic flashcard generation.
* Interactive flashcard viewer with flip animations.
* Daily query limits for free users (reset each day).
* Upgrade page for collecting preferred payment methods.
* Admin route to mark users as Pro after manual payment confirmation.

---

## 🛠️ Future Improvements

* Integrate real payment processors (Stripe, PayPal, M-Pesa APIs).
* Add search and tagging for flashcard sets.
* Export flashcards to PDF/CSV.
* Enable spaced-repetition learning mode.
* Deploy on cloud (Heroku, Render, or AWS).

---

## 📧 Contact

For any inquiries, feel free to reach out:

* Developer: **Your Name**
* Email: **[your.email@example.com](mailto:your.email@example.com)**

---

```

Do you want me to also create a **requirements.txt** with the exact libraries needed so you can run `pip install -r requirements.txt` immediately?
```
