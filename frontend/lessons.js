/*
==============================================================
CST3144 FULL-STACK COURSEWORK — FRONTEND LOGIC (Vue.js SPA)
==============================================================
*/

const app = new Vue({
  el: "#app",

  data: {
    // ----- LESSON DATA (from backend API) -----
    lessons: [],

    // ----- UI + CART STATE -----
    // cart items will be: { _id, subject, price, location, quantity, image }
    cart: [],
    showCart: false,
    searchTerm: "",
    sortBy: "subject",
    sortOrder: "asc",

    // Checkout form fields
    name: "",
    phone: "",
    email: "",

    // Validation + messages
    orderConfirmed: false,
    nameError: "",
    phoneError: "",
    emailError: "",
    orderMessage: "",
    lastOrderName: "",
    lastOrderEmail: ""
  },

  // Fetch lessons from backend when app is created
  created: function () {
    fetch("http://localhost:4000/lessons")
      .then(function (response) {
        return response.json();
      })
      .then(
        function (data) {
          this.lessons = data;

          // reset state (safe)
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

    // Sort filtered lessons
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

    // Total items in cart (for badge + disabling cart button)
    cartItemCount: function () {
      return this.cart.reduce(function (total, item) {
        return total + item.quantity;
      }, 0);
    },

    // Total price of cart
    cartTotal: function () {
      return this.cart.reduce(function (total, item) {
        return total + item.price * item.quantity;
      }, 0);
    },

    // Optional form validity check
    isFormValid: function () {
      var nameOk = /^[A-Za-z ]+$/.test(this.name.trim());
      var phoneOk = /^[0-9]{8,15}$/.test(this.phone.trim());
      var emailOk = /^\S+@\S+\.\S+$/.test(this.email.trim());
      return nameOk && phoneOk && emailOk && this.cartItemCount > 0;
    },

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
    goHome: function () {
      this.showCart = false;
    },

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

    // ✅ Add a lesson to cart (uses MongoDB _id)
    addToCart: function (lesson) {
      if (!lesson || lesson.spaces <= 0) return;

      // If user starts a new order, re-enable checkout
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

      // Decrement available spaces in the UI
      lesson.spaces -= 1;
    },

    // ✅ Increase quantity (find lesson by _id)
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

    // ✅ Decrease quantity (find lesson by _id)
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

    // ✅ Remove item (restore spaces using _id match)
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

    // Checkout: POST order then PUT updated spaces
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
        // 1) POST the order
        var orderResponse = await fetch("http://localhost:4000/orders", {
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

        // 2) Show thank you message
        this.lastOrderName = cleanName;
        this.lastOrderEmail = cleanEmail;
        this.orderConfirmed = true;
        this.orderMessage = "";

        // Keep a copy of what was ordered (so we can update the DB)
        var savedCart = this.cart.map(function (item) {
          return Object.assign({}, item);
        });

        // 3) Clear UI form + cart
        this.name = "";
        this.phone = "";
        this.email = "";
        this.cart = [];

        // 4) Update lesson spaces in MongoDB
        await Promise.all(
          savedCart.map(
            async function (item) {
              var lesson = this.lessons.find(function (l) {
                return l._id === item._id;
              });
              if (!lesson) return;

              await fetch("http://localhost:4000/lessons/" + lesson._id, {
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