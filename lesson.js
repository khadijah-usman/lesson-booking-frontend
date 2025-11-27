// lessons.js

const app = new Vue({
    el: '#app',
  
    data: {
      lessons: [],
      cart: [],
      showCart: false,
  
      sortBy: 'subject',
      sortOrder: 'asc',
      searchTerm: '',
  
      checkoutName: '',
      checkoutPhone: '',
      orderMessage: ''
    },
  
    computed: {
      filteredAndSortedLessons() {
        // 1) Filter by search
        let filtered = this.lessons.filter((lesson) => {
          const text = (lesson.subject + ' ' + lesson.location).toLowerCase();
          return text.includes(this.searchTerm.toLowerCase());
        });
  
        // 2) Sort
        const field = this.sortBy;
        const order = this.sortOrder;
  
        filtered.sort((a, b) => {
          let A = a[field];
          let B = b[field];
  
          if (field === 'price' || field === 'spaces') {
            A = Number(A);
            B = Number(B);
          } else {
            A = String(A).toLowerCase();
            B = String(B).toLowerCase();
          }
  
          if (A < B) return order === 'asc' ? -1 : 1;
          if (A > B) return order === 'asc' ? 1 : -1;
          return 0;
        });
  
        return filtered;
      },
  
      isCheckoutValid() {
        const nameOk = /^[A-Za-z\s]+$/.test(this.checkoutName.trim());
        const phoneOk = /^[0-9]+$/.test(this.checkoutPhone.trim());
        return nameOk && phoneOk;
      }
    },
  
    methods: {
      fetchLessons() {
        // TODO: change this to your real backend URL when ready
        // For local testing with your Express server:
        // const url = 'http://localhost:3000/lessons';
        const url = 'http://localhost:3000/lessons';
  
        fetch(url)
          .then((res) => res.json())
          .then((data) => {
            this.lessons = data;
          })
          .catch((err) => {
            console.error('Error fetching lessons:', err);
            // TEMP: fallback dummy data so you can test frontend
            this.lessons = [
              {
                id: 1,
                subject: 'Mathematics',
                location: 'Hendon',
                price: 100,
                spaces: 5,
                icon: 'fa-solid fa-calculator'
              },
              {
                id: 2,
                subject: 'English',
                location: 'Colindale',
                price: 80,
                spaces: 3,
                icon: 'fa-solid fa-book-open'
              }
            ];
          });
      },
  
      toggleCart() {
        this.showCart = !this.showCart;
      },
  
      addToCart(lesson) {
        if (lesson.spaces > 0) {
          this.cart.push(lesson);
          lesson.spaces--;
        }
      },
  
      removeFromCart(index) {
        const lesson = this.cart[index];
        lesson.spaces++;
        this.cart.splice(index, 1);
      },
  
      submitOrder() {
        if (!this.isCheckoutValid || this.cart.length === 0) {
          return;
        }
  
        const order = {
          name: this.checkoutName.trim(),
          phone: this.checkoutPhone.trim(),
          lessons: this.cart.map((l) => l._id || l.id)
        };
  
        // TODO: change to your deployed backend URL later
        const url = 'http://localhost:3000/orders';
  
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(order)
        })
          .then((res) => res.json())
          .then(() => {
            this.orderMessage = 'Order submitted successfully!';
            this.cart = [];
          })
          .catch((err) => {
            console.error('Error submitting order:', err);
            this.orderMessage = 'Something went wrong. Please try again.';
          });
      }
    },
  
    created() {
      this.fetchLessons();
    }
  });