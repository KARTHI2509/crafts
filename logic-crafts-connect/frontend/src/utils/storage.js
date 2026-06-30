export const storage = {
	setToken: (token) => localStorage.setItem("token", token),

	getToken: () => localStorage.getItem("token"),

	removeToken: () => localStorage.removeItem("token"),

	setUser: (user) =>
		localStorage.setItem("user", JSON.stringify(user)),

	getUser: () => {
		const user = localStorage.getItem("user");
		return user ? JSON.parse(user) : null;
	},

	removeUser: () => localStorage.removeItem("user"),

	setRole: (role) => localStorage.setItem("role", role),

	getRole: () => localStorage.getItem("role"),

	clearAll: () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		localStorage.removeItem("role");
	},
};
