// DOM Elements
const loginPage = document.getElementById("loginPage")
const homePage = document.getElementById("homePage")
const loginForm = document.getElementById("loginForm")
const welcomeMessage = document.getElementById("welcomeMessage")
const themeToggle = document.getElementById("themeToggle")
const logoutButton = document.getElementById("logoutButton")
const entryDate = document.getElementById("entryDate")
const entryContent = document.getElementById("entryContent")
const addEntryButton = document.getElementById("addEntryButton")
const calendar = document.getElementById("calendar")
const entriesList = document.getElementById("entriesList")
const shareButton = document.getElementById("shareButton")
const toast = document.getElementById("toast")

// User data
const users = [
  { username: "Jonas", password: "1111" },
  { username: "umymasyed", password: "2244" },
  { username: "Sarah", password: "3322" },
]

let currentUser = null
let entries = []

// Helper functions
function showToast(message) {
  toast.textContent = message
  toast.style.display = "block"
  toast.style.animation = "none"
  toast.offsetHeight // Trigger reflow
  toast.style.animation = null
  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease-in forwards"
  }, 3000)
}

function authenticateUser(username, password) {
  return users.find((user) => user.username === username && user.password === password)
}

function saveEntries() {
  localStorage.setItem(`entries_${currentUser.username}`, JSON.stringify(entries))
}

function loadEntries() {
  const storedEntries = localStorage.getItem(`entries_${currentUser.username}`)
  entries = storedEntries ? JSON.parse(storedEntries) : []
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
}

// Event Listeners
loginForm.addEventListener("submit", (e) => {
  e.preventDefault()
  const username = document.getElementById("username").value
  const password = document.getElementById("password").value
  const user = authenticateUser(username, password)
  if (user) {
    currentUser = user
    localStorage.setItem("user", JSON.stringify(currentUser))
    loadEntries()
    showHomePage()
  } else {
    showToast("Invalid username or password")
  }
})

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark")
  const isDark = document.body.classList.contains("dark")
  themeToggle.innerHTML = `<i class="fas fa-${isDark ? "sun" : "moon"}"></i> `
  localStorage.setItem("theme", isDark ? "dark" : "light")
})

logoutButton.addEventListener("click", () => {
  localStorage.removeItem("user")
  showLoginPage()
})

addEntryButton.addEventListener("click", () => {
  const content = entryContent.value.trim()
  if (content) {
    const newEntry = {
      id: Date.now().toString(),
      date: entryDate.value,
      content: content,
    }
    entries.unshift(newEntry)
    saveEntries()
    entryContent.value = ""
    renderEntries()
    renderCalendar()
    showToast("New entry added!")
  }
})

shareButton.addEventListener("click", () => {
  if (entries.length > 0) {
    const shareText = entries.map((entry) => `${formatDate(entry.date)}\n${entry.content}`).join("\n\n")
    navigator.clipboard
      .writeText(shareText)
      .then(() => showToast("Diary entries copied to clipboard!"))
      .catch(() => showToast("Failed to copy entries to clipboard"))
  } else {
    showToast("No entries to share")
  }
})

function renderEntries() {
  entriesList.innerHTML = ""
  entries.forEach((entry, index) => {
    const entryElement = document.createElement("div")
    entryElement.className = "card card-hover"
    entryElement.style.animation = `fadeIn 0.3s ease-out ${index * 0.1}s both`
    entryElement.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">
                    <i class="fas fa-calendar-day"></i>
                    ${formatDate(entry.date)}
                </h3>
            </div>
            <div class="card-content">
                <p>${entry.content}</p>
                <div class="entry-actions">
                    <button class="button button-delete button-hover" data-id="${entry.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `
    entriesList.appendChild(entryElement)
  })

  // Add event listeners for delete buttons
  document.querySelectorAll(".button-delete").forEach((button) => {
    button.addEventListener("click", (e) => {
      const entryId = e.currentTarget.dataset.id
      deleteEntry(entryId)
    })
  })
}

function deleteEntry(entryId) {
  entries = entries.filter((entry) => entry.id !== entryId)
  saveEntries()
  renderEntries()
  renderCalendar()
  showToast("Entry deleted successfully!")
}

function renderCalendar() {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  const firstDay = new Date(currentYear, currentMonth, 1)
  const lastDay = new Date(currentYear, currentMonth + 1, 0)

  calendar.innerHTML = ""

  for (let i = 0; i < 7; i++) {
    const dayName = new Date(2023, 0, i + 1).toLocaleDateString("en-US", { weekday: "short" })
    const dayElement = document.createElement("div")
    dayElement.className = "calendar-day"
    dayElement.textContent = dayName
    calendar.appendChild(dayElement)
  }

  for (let i = 0; i < firstDay.getDay(); i++) {
    const emptyDay = document.createElement("div")
    emptyDay.className = "calendar-day"
    calendar.appendChild(emptyDay)
  }

  for (let i = 1; i <= lastDay.getDate(); i++) {
    const dayElement = document.createElement("div")
    dayElement.className = "calendar-day"
    dayElement.textContent = i

    const currentDate = new Date(currentYear, currentMonth, i)
    if (entries.some((entry) => new Date(entry.date).toDateString() === currentDate.toDateString())) {
      dayElement.classList.add("has-entry")
    }

    if (currentDate.toDateString() === today.toDateString()) {
      dayElement.classList.add("selected")
    }

    dayElement.addEventListener("click", () => {
      entryDate.valueAsDate = currentDate
    })

    calendar.appendChild(dayElement)
  }
}

function showLoginPage() {
  loginPage.style.display = "flex"
  loginPage.style.animation = "fadeIn 0.3s ease-out"
  homePage.style.display = "none"
}

function showHomePage() {
  loginPage.style.display = "none"
  homePage.style.display = "block"
  homePage.style.animation = "fadeIn 0.3s ease-out"
  welcomeMessage.textContent = `Welcome, ${currentUser.username}`
  renderEntries()
  renderCalendar()
}

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  const storedUser = localStorage.getItem("user")
  if (storedUser) {
    currentUser = JSON.parse(storedUser)
    loadEntries()
    showHomePage()
  } else {
    showLoginPage()
  }

  const storedTheme = localStorage.getItem("theme")
  if (storedTheme === "dark") {
    document.body.classList.add("dark")
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>'
  }

  entryDate.valueAsDate = new Date()
})

