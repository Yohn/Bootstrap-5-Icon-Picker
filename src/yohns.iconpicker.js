class IconPicker {
	static icons = null;
	static iconUrl = "";
	static customIcons = null;

	constructor(elementId, options = {}) {
		this.el = document.getElementById(elementId);
		if (!this.el) {
			console.error(`Element with ID ${elementId} not found.`);
			return;
		}
		this.options = options;
		this.iconTarget = options.iconTarget
			? document.querySelector(options.iconTarget)
			: ""; //this.el.querySelector('.input-group-text > i');
		this.defaultIcon = options.defaultIcon || "";
		this.addClass = options.addClass || "bi";
		this.btnClass = options.btnClass || "btn-outline-secondary";
		this.searchPlaceholder = options.searchPlaceholder || "Search Icons..";
		this.container = options.container
			? document.querySelector(options.container)
			: this.el;
		(async () => {
			await this.initializePicker();
			this.attachEventListeners();
		})();

		// Set default icon if provided
		if (this.defaultIcon) {
			this.setIcon(this.defaultIcon);
		}
	}

	// Initialize the icon picker by loading icons from either JSON or custom array/object
	async initializePicker() {
		if (!IconPicker.icons) {
			if (IconPicker.customIcons) {
				IconPicker.icons = IconPicker.customIcons;
			} else {
				try {
					const response = await fetch(IconPicker.iconUrl);
					const data = await response.json();
					console.log(data); // Verify structure
					IconPicker.icons = data; // Adjust if needed
				} catch (error) {
					console.error("Error loading icons:", error);
					return;
				}
			}
		}

		let drop = document.createElement("div"),
			menu = document.createElement("div"),
			search = document.createElement("input"),
			ul = document.createElement("div");
		drop.classList.add("dropdown", "yo-iconpicker");
		if (this.options.wrapperClass) {
			drop.classList.add(this.options.wrapperClass);
		}
		menu.classList.add("dropdown-menu", "p-3", "iconpicker-dropdown"); // aria-labelledby="icon-picker-input" do I put this?
		search.type = "text";
		search.placeholder = this.searchPlaceholder;
		search.classList.add("form-control", "mb-3", "icon-search");
		ul.classList.add("row", "row-cols-4", "g-2", "icon-list"); //
		ul.innerHTML = IconPicker.icons
			.map(
				(icon) =>
					`<div class="col" data-value="${icon}"><button type="button" class="btn ${this.btnClass}"><i class="${this.addClass} ${icon}"></i></button></div>`
			)
			.join("");
		menu.append(search);
		menu.append(ul);
		drop.append(menu);
		this.container.append(drop);
	}

	// Attach event listeners
	attachEventListeners() {
		this.trigger = this.el;
		this.dropdownMenu = this.container.querySelector(".dropdown-menu");
		this.searchInput = this.container.querySelector(".icon-search");
		this.iconList = this.container.querySelector(".icon-list");

		if (!this.trigger) {
			console.error("trigger elements for event listeners not found.");
			return;
		}
		if (!this.dropdownMenu) {
			console.error("dropdownMenu elements for event listeners not found.");
			return;
		}
		if (!this.searchInput) {
			console.error("searchInput elements for event listeners not found.");
			return;
		}
		if (!this.iconList) {
			console.error("iconList elements for event listeners not found.");
			return;
		}

		this.handleToggleDropdown = () => this.toggleDropdown();
		this.handleFilterIcons = () => this.filterIcons();
		this.handleSelectIcon = (event) => this.selectIcon(event);
		this.handleClickOutside = (event) => this.clickOutside(event);

		// Toggle dropdown visibility on icon click
		this.trigger.addEventListener("click", this.handleToggleDropdown);
		// Prevent the dropdown from hiding when interacting with the search input
		this.searchInput.addEventListener("click", (e) => e.stopPropagation());
		this.searchInput.addEventListener("focus", (e) => e.stopPropagation());
		// Filter icons based on search input
		this.searchInput.addEventListener("input", this.handleFilterIcons);
		// Handle icon selection
		this.iconList.addEventListener("click", this.handleSelectIcon);

		// Listen for clicks outside the dropdown to close it
		document.addEventListener("click", this.handleClickOutside);
	}

	// Detect clicks outside the dropdown
	clickOutside(event) {
		if (
			!this.container.contains(event.target) &&
			!this.el.contains(event.target)
		) {
			this.dropdownMenu.classList.remove("show");
		}
	}
	// Set icon to input group text
	setIcon(icon) {
		if (this.iconTarget) {
			this.iconTarget.setAttribute("class", this.addClass + " " + icon);
		}
	}

	toggleDropdown() {
		this.dropdownMenu.classList.toggle("show");
	}

	filterIcons() {
		const filter = this.searchInput.value.toLowerCase();
		const items = this.iconList.querySelectorAll("div.col");
		items.forEach((item) => {
			const text = item.getAttribute("data-value").toLowerCase();
			item.style.display = text.includes(filter) ? "" : "none";
		});
	}

	selectIcon(event) {
		event.stopPropagation();
		const target = event.target.closest("div.col");
		if (target) {
			const value = target.getAttribute("data-value");
			this.setIcon(value);
			this.dropdownMenu.classList.remove("show");
			//this.toggleDropdown()
		}
	}

	// Destroy method to remove all event listeners
	destroy() {
		if (!this.trigger || !this.searchInput || !this.iconList) {
			console.error(
				"One or more elements for removing event listeners not found."
			);
			return;
		}
		// Remove event listeners
		this.trigger.removeEventListener("click", this.handleToggleDropdown);
		this.searchInput.removeEventListener("input", this.handleFilterIcons);
		this.iconList.removeEventListener("click", this.handleSelectIcon);
		document.removeEventListener("click", this.handleClickOutside); // Cleanup the document click listener
		this.container.querySelector(".dropdown-menu").remove();
	}

	// Static method to set the icon URL (to be called before initialization)
	static setIconUrl(url) {
		IconPicker.iconUrl = url;
	}

	// Static method to set custom icons array (to be called before initialization)
	static setCustomIcons(icons) {
		IconPicker.customIcons = icons;
	}
}

// Function to initialize IconPicker for new elements
function initializeIconPicker(elementId, options) {
	new IconPicker(elementId, options);
}