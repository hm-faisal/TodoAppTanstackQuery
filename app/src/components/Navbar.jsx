import useAuth from "../hooks/useAuth";
import LoginPage from "./SignIn";

const Navbar = () => {
  const { user, signOutUser } = useAuth();
  // insert To Do

  return (
    <>
      <div className="min-h-10 bg-gray-100 flex justify-between items-center px-4 py-2 max-w-11/12 mx-auto">
        <div className="todo"></div>
        <div className="user flex justify-between items-center gap-4">
          <img
            src={user?.photoURL}
            alt="User Profile"
            className="w-12 h-12 rounded-full inline-block"
          />
          <span className="font-bold text-sm">{user?.displayName}</span>
          <button
            type="button"
            className="py-2 px-4 border border-gray-400 rounded bg-white"
            onClick={() => signOutUser()}
          >
            logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;
