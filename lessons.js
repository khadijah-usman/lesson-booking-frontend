/*
==============================================================
CST3144 FULL-STACK COURSEWORK — FRONTEND LOGIC (Vue.js SPA)

This file controls:
- Lesson data (10 items with subject, location, price, spaces)
- Searching and sorting of lessons
- Add-to-cart behaviour with spaces decrement
- Cart quantity updates (+ / -)
- Line totals and cart total calculation
- Checkout form validation (Name + Phone)
- Order confirmation message

All UI bindings are in index.html.
==============================================================
*/

// Vue 2 style: new Vue({...}) instead of createApp().mount()
const app = new Vue({
    el: '#app',
  
    data: {
      /*
      ==========================================================
      LESSON DATA (Front-end only version)
      - Each lesson begins with 5 spaces (coursework requirement)
      - image can be remote URL or local PNG
      ==========================================================
      */
      lessons: [
        {
          id: 1,
          subject: "Mathematics",
          location: "Hendon",
          price: 100,
          spaces: 5,
          icon: "fa-solid fa-calculator",
          image: "https://img.icons8.com/color/240/calculator--v1.png"
        },
        {
          id: 2,
          subject: "English",
          location: "Colindale",
          price: 80,
          spaces: 5,
          icon: "fa-solid fa-book-open",
          image: "https://img.icons8.com/color/240/book-reading.png"
        },
        {
          id: 3,
          subject: "Biology",
          location: "Golders Green",
          price: 90,
          spaces: 5,
          icon: "fa-solid fa-seedling",
          image: "https://img.icons8.com/color/240/dna-helix.png"
        },
        {
          id: 4,
          subject: "Chemistry",
          location: "Brent Cross",
          price: 70,
          spaces: 5,
          icon: "fa-solid fa-flask",
          image: "https://img.icons8.com/color/240/test-tube.png"
        },
        {
          id: 5,
          subject: "History",
          location: "Hendon",
          price: 50,
          spaces: 5,
          icon: "fa-solid fa-landmark",
          image: "https://img.icons8.com/color/240/scroll.png"
        },
        {
          id: 6,
          subject: "Physics",
          location: "Colindale",
          price: 95,
          spaces: 5,
          icon: "fa-solid fa-atom",
          image: "https://img.icons8.com/color/240/physics.png"
        },
        {
          id: 7,
          subject: "Art",
          location: "Brent Cross",
          price: 60,
          spaces: 5,
          icon: "fa-solid fa-palette",
          image: "https://img.icons8.com/color/240/art-prices.png"
        },
        {
          id: 8,
          subject: "Geography",
          location: "Golders Green",
          price: 85,
          spaces: 5,
          icon: "fa-solid fa-earth-europe",
          image: "https://img.icons8.com/color/240/globe--v1.png"
        },
        {
          id: 9,
          subject: "Computer Science",
          location: "Hendon",
          price: 120,
          spaces: 5,
          icon: "fa-solid fa-code",
          image: "https://img.icons8.com/color/240/source-code.png"
        },
        {
          id: 10,
          subject: "Economics",
          location: "Colindale",
          price: 110,
          spaces: 5,
          icon: "fa-solid fa-chart-line",
          image: "https://img.icons8.com/color/240/economic-improvement.png"
        }
      ],
  
      /*
      ==========================================================
      UI + CART STATE
      ==========================================================
      */
      cart: [],             // [{ id, subject, price, location, quantity, image }]
      showCart: false,
      searchTerm: "",
      sortBy: "subject",
      sortOrder: "asc",
      name: "",
      phone: "",
      orderConfirmed: false,
      nameError: "",
      phoneError: ""
    },
  
    computed: {
      /*
      ==========================================================
      SEARCH FILTER
      ==========================================================
      */
      filteredLessons: function () {
        var term = this.searchTerm.trim().toLowerCase();
        if (!term) return this.lessons;
  
        return this.lessons.filter(function (l) {
          return (
            l.subject.toLowerCase().includes(term) ||
            l.location.toLowerCase().includes(term) ||
            String(l.price).includes(term) ||
            String(l.spaces).includes(term)
          );
        });
      },
  
      /*
      ==========================================================
      SORTING (ASC/DESC)
      ==========================================================
      */
      sortedAndFilteredLessons: function () {
        var factor = this.sortOrder === "asc" ? 1 : -1;
  
        // slice() so we don't mutate original
        return this.filteredLessons.slice().sort((a, b) => {
          if (a[this.sortBy] < b[this.sortBy]) return -1 * factor;
          if (a[this.sortBy] > b[this.sortBy]) return 1 * factor;
          return 0;
        });
      },
  
      /*
      ==========================================================
      CART COUNT + TOTAL PRICE
      ==========================================================
      */
      cartItemCount: function () {
        return this.cart.reduce(function (sum, item) {
          return sum + item.quantity;
        }, 0);
      },
  
      cartTotal: function () {
        return this.cart.reduce(function (sum, item) {
          return sum + item.price * item.quantity;
        }, 0);
      },
  
      /*
      ==========================================================
      VALIDATION CHECK
      - Name: letters + spaces only
      - Phone: 8–15 digits
      ==========================================================
      */
      isFormValid: function () {
        var nameOk = /^[A-Za-z ]+$/.test(this.name.trim());
        var phoneOk = /^[0-9]{8,15}$/.test(this.phone.trim());
        return nameOk && phoneOk;
      }
    },
  
    methods: {
      // Go back to lesson list from cart view
      goHome: function () {
        this.showCart = false;
      },
  
      /*
      ==========================================================
      CART LOGIC: ADD + REMOVE + QUANTITY UPDATES
      ==========================================================
      */
  
      // Add one lesson to cart and reduce spaces by 1
      addToCart: function (lesson) {
        if (lesson.spaces <= 0) return; // full
  
        var existing = this.cart.find(function (i) {
          return i.id === lesson.id;
        });
  
        if (existing) {
          existing.quantity += 1;
        } else {
          this.cart.push({
            id: lesson.id,
            subject: lesson.subject,
            location: lesson.location,
            price: lesson.price,
            image: lesson.image,
            quantity: 1
          });
        }
  
        // Decrease available spaces
        lesson.spaces -= 1;
      },
  
      // Increase quantity if spaces available
      increaseQuantity: function (index) {
        var item = this.cart[index];
        var lesson = this.lessons.find(function (l) {
          return l.id === item.id;
        });
  
        if (lesson && lesson.spaces > 0) {
          item.quantity += 1;
          lesson.spaces -= 1;
        }
      },
  
      // Decrease quantity or remove item if it hits zero
      decreaseQuantity: function (index) {
        var item = this.cart[index];
        var lesson = this.lessons.find(function (l) {
          return l.id === item.id;
        });
  
        if (!lesson) return;
  
        if (item.quantity > 1) {
          item.quantity -= 1;
          lesson.spaces += 1;
        } else {
          this.removeFromCart(index);
        }
      },
  
      // Remove entire item and restore all its spaces
      removeFromCart: function (index) {
        var item = this.cart[index];
        var lesson = this.lessons.find(function (l) {
          return l.id === item.id;
        });
  
        if (lesson) {
          lesson.spaces += item.quantity;
        }
  
        this.cart.splice(index, 1);
      },
  
      /*
      ==========================================================
      CHECKOUT LOGIC
      ==========================================================
      */
      checkout: function () {
        this.nameError = "";
        this.phoneError = "";
        this.orderConfirmed = false;
  
        var namePattern = /^[A-Za-z ]+$/;
        var phonePattern = /^[0-9]{8,15}$/;
  
        if (!namePattern.test(this.name.trim())) {
          this.nameError = "Name must contain letters and spaces only.";
        }
  
        if (!phonePattern.test(this.phone.trim())) {
          this.phoneError = "Phone number must contain 8–15 digits.";
        }
  
        if (this.nameError || this.phoneError || !this.cart.length) {
          return; // stop checkout
        }
  
        // (Future) Backend order API call goes here (fetch POST /orders)
  
        this.orderConfirmed = true;
  
        // Reset cart & form after brief delay
        var self = this;
        setTimeout(function () {
          self.cart = [];
          self.name = "";
          self.phone = "";
        }, 1200);
      }
    }
  });