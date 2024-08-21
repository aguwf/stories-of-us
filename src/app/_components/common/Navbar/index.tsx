import { Layout, Menu } from "antd";

const { Header } = Layout;

const Navbar = () => {
	return (
		<nav className="navbar">
			<Layout>
				<Header>
					{/* Logo */}
					<div className="logo">
						<img src="/logo.png" alt="Logo" />
					</div>
					{/* Navigation Links */}
					<Menu theme="dark" mode="horizontal" defaultSelectedKeys={["1"]}>
						<Menu.Item key="1">Home</Menu.Item>
						<Menu.Item key="2">About</Menu.Item>
						<Menu.Item key="3">Contact</Menu.Item>
					</Menu>
					{/* Login/Signup Button */}
					<div className="login-signup" />
				</Header>
			</Layout>
		</nav>
	);
};

export default Navbar;
