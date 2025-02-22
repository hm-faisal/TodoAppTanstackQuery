import LoadingSkeleton from "./components/Loading";
import Navbar from "./components/Navbar";
import LoginPage from "./components/SignIn";
import useAuth from "./hooks/useAuth";
import TodoApp from "./ToDo";

const App = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return <LoadingSkeleton />;
  }
  if (!user) {
    return <LoginPage />;
  }
  return (
    <>
      <Navbar />
      <TodoApp email={user?.email} />
    </>
  );
};

export default App;
