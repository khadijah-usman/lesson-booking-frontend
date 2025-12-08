/*
  CST3144 Lesson Booking Frontend Logic
  Vue.js code for LessonHub: lesson list, search/sort, cart and checkout.
*/

// Base URL of the deployed backend on Render
const API_BASE = "https://lesson-booking-backend-6y52.onrender.com";

const app = new Vue({
  el: "#app",

  data: {
    // Lesson data loaded from the backend API
    lessons: [],

    // Cart and UI state
    // cart items look like: { _id, subject, price, location, quantity, image }
    cart: [],
    showCart: false,
    searchTerm: "",
    sortBy: "subject",
    sortOrder: "asc",

    // Checkout form fields
    name: "",
    phone: "",
    email: "",

    // Validation and feedback messages
    orderConfirmed: false,
    nameError: "",
    phoneError: "",
    emailError: "",
    orderMessage: "",
    lastOrderName: "",
    lastOrderEmail: ""
  },

  // Load lessons from the backend when the app starts
  created: function () {
    fetch(API_BASE + "/lessons")
      .then(function (response) {
        return response.json();
      })
      .then(
        function (data) {
          this.lessons = data;

          // Reset state when fresh data is loaded
          this.cart = [];
          this.orderConfirmed = false;
          this.orderMessage = "";
        }.bind(this)
      )
      .catch(function (error) {
        console.error("Error loading lessons:", error);
      });
  },

  computed: {
    // Filter lessons based on search term
    filteredLessons: function () {
      var term = this.searchTerm.trim().toLowerCase();
      if (!term) return this.lessons;

      return this.lessons.filter(function (l) {
        return (
          String(l.subject || "").toLowerCase().includes(term) ||
          String(l.location || "").toLowerCase().includes(term) ||
          String(l.price).includes(term) ||
          String(l.spaces).includes(term)
        );
      });
    },

    // Sort filtered lessons by the selected field and order
    sortedAndFilteredLessons: function () {
      var factor = this.sortOrder === "asc" ? 1 : -1;

      return this.filteredLessons.slice().sort(
        function (a, b) {
          var x = a[this.sortBy];
          var y = b[this.sortBy];

          // Make string sorts consistent
          if (typeof x === "string") x = x.toLowerCase();
          if (typeof y === "string") y = y.toLowerCase();

          if (x < y) return -1 * factor;
          if (x > y) return 1 * factor;
          return 0;
        }.bind(this)
      );
    },

    // Total items in cart (used for the cart badge and button state)
    cartItemCount: function () {
      return this.cart.reduce(function (total, item) {
        return total + item.quantity;
      }, 0);
    },

    // Total price of all items in the cart
    cartTotal: function () {
      return this.cart.reduce(function (total, item) {
        return total + item.price * item.quantity;
      }, 0);
    },

    // Simple form validity check for enabling the checkout button
    isFormValid: function () {
      var nameOk = /^[A-Za-z ]+$/.test(this.name.trim());
      var phoneOk = /^[0-9]{8,15}$/.test(this.phone.trim());
      var emailOk = /^\S+@\S+\.\S+$/.test(this.email.trim());
      return nameOk && phoneOk && emailOk && this.cartItemCount > 0;
    },

    // Optional feedback message if no lessons are found
    feedbackMessage: function () {
      if (this.sortedAndFilteredLessons.length === 0) {
        if (this.searchTerm.trim()) {
          return "No lessons match your search. Try a different keyword.";
        }
        return "No lessons available.";
      }
      return "";
    }
  },

  methods: {
    // Return to the main lesson list view
    goHome: function () {
      this.showCart = false;
    },

    // Toggle between lesson list and cart view
    toggleCart: function () {
      if (this.cartItemCount === 0) return;
      this.showCart = !this.showCart;
    },

    changeSort: function (field) {
      this.sortBy = field;
    },

    changeSortOrder: function (order) {
      this.sortOrder = order;
    },

    // Add a lesson to the cart (using its MongoDB _id)
    addToCart: function (lesson) {
      if (!lesson || lesson.spaces <= 0) return;

      // If the user starts a new order, allow checkout again
      this.orderConfirmed = false;

      var existing = this.cart.find(function (item) {
        return item._id === lesson._id;
      });

      if (existing) {
        existing.quantity += 1;
      } else {
        this.cart.push({
          _id: lesson._id,
          subject: lesson.subject,
          price: lesson.price,
          location: lesson.location,
          quantity: 1,
          image: lesson.image
        });
      }

      // Decrease available spaces in the UI
      lesson.spaces -= 1;
    },

    // Increase quantity of an item in the cart
    increaseQuantity: function (index) {
      var cartItem = this.cart[index];
      if (!cartItem) return;

      var lesson = this.lessons.find(function (l) {
        return l._id === cartItem._id;
      });

      if (lesson && lesson.spaces > 0) {
        cartItem.quantity += 1;
        lesson.spaces -= 1;
      }
    },

    // Decrease quantity of an item in the cart (or remove it)
    decreaseQuantity: function (index) {
      var cartItem = this.cart[index];
      if (!cartItem) return;

      var lesson = this.lessons.find(function (l) {
        return l._id === cartItem._id;
      });

      if (cartItem.quantity > 1) {
        cartItem.quantity -= 1;
        if (lesson) lesson.spaces += 1;
      } else {
        this.removeFromCart(index);
      }
    },

    // Remove an item from the cart and restore its spaces
    removeFromCart: function (index) {
      var cartItem = this.cart[index];
      if (!cartItem) return;

      var lesson = this.lessons.find(function (l) {
        return l._id === cartItem._id;
      });

      if (lesson) {
        lesson.spaces += cartItem.quantity;
      }

      this.cart.splice(index, 1);
    },

    // Validate the checkout form and set field error messages
    validateCheckout: function () {
      var valid = true;

      // Reset errors
      this.nameError = "";
      this.phoneError = "";
      this.emailError = "";
      this.orderMessage = "";

      var trimmedName = this.name.trim();
      var trimmedPhone = this.phone.trim();
      var trimmedEmail = this.email.trim();

      // Name validation
      if (!trimmedName) {
        this.nameError = "Name is required.";
        valid = false;
      } else if (!/^[A-Za-z ]+$/.test(trimmedName)) {
        this.nameError = "Name must contain letters and spaces only.";
        valid = false;
      }

      // Phone validation
      if (!trimmedPhone) {
        this.phoneError = "Phone number is required.";
        valid = false;
      } else if (!/^[0-9]+$/.test(trimmedPhone)) {
        this.phoneError = "Phone number must contain digits only.";
        valid = false;
      } else if (trimmedPhone.length < 7) {
        this.phoneError = "Phone number seems too short.";
        valid = false;
      }

      // Email validation
      if (!trimmedEmail) {
        this.emailError = "Email is required.";
        valid = false;
      } else if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
        this.emailError = "Please enter a valid email address.";
        valid = false;
      }

      // Cart must not be empty
      if (this.cartItemCount === 0) {
        this.orderMessage = "Your cart is empty. Add at least one lesson.";
        valid = false;
      }

      return valid;
    },

    // Checkout: send the order to the backend, then update lesson spaces
    checkout: async function () {
      if (!this.validateCheckout()) return;

      var cleanName = this.name.trim();
      var cleanPhone = this.phone.trim();
      var cleanEmail = this.email.trim();

      var orderPayload = {
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        lessons: this.cart.map(function (item) {
          return {
            lessonId: item._id,
            quantity: item.quantity
          };
        })
      };

      try {
        // Send order to the backend (POST /orders)
        var orderResponse = await fetch(API_BASE + "/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderPayload)
        });

        if (!orderResponse.ok) {
          var errBody = await orderResponse.json().catch(function () {
            return {};
          });
          console.error("Order error:", errBody);
          this.orderMessage =
            "There was a problem placing your order. Please try again.";
          return;
        }

        // Show thank-you message
        this.lastOrderName = cleanName;
        this.lastOrderEmail = cleanEmail;
        this.orderConfirmed = true;
        this.orderMessage = "";

        // Keep a copy of what was ordered (for updating spaces)
        var savedCart = this.cart.map(function (item) {
          return Object.assign({}, item);
        });

        // Clear form and cart in the UI
        this.name = "";
        this.phone = "";
        this.email = "";
        this.cart = [];

        // Update lesson spaces in MongoDB (PUT /lessons/:id)
        await Promise.all(
          savedCart.map(
            async function (item) {
              var lesson = this.lessons.find(function (l) {
                return l._id === item._id;
              });
              if (!lesson) return;

              await fetch(API_BASE + "/lessons/" + lesson._id, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ spaces: lesson.spaces })
              });
            }.bind(this)
          )
        );
      } catch (error) {
        console.error("Checkout error:", error);
        this.orderMessage =
          "There was a problem connecting to the server. Please try again.";
      }
    }
  }
});