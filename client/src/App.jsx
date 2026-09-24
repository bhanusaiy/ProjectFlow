import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Team from "./pages/manager/team";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import ProtectedRoute from "./routes/ProtectedRoute";
import JoinTeam from "./pages/invitation/JoinTeam";


import ManagerDashboard from "./pages/manager/ManagerDashboard";
import Projects from "./pages/manager/Projects";
import ProjectDetails from "./pages/manager/ProjectDetails";
import ManagerTasks from "./pages/manager/ManagerTasks";
import ManagerSettings from "./pages/manager/ManagerSettings";
import ManagerTaskDetails from "./pages/manager/ManagerTaskDetails";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import EmployeeTasks from "./pages/employee/EmployeeTasks";
import EmployeeProjects from "./pages/employee/EmployeeProjects";
import EmployeeSettings from "./pages/employee/EmployeeSettings";
import EmployeeProjectDetails from "./pages/employee/EmployeeProjectDetails";
import EmployeeTaskDetails from "./pages/employee/EmployeeTaskDetails";



const App = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            PUBLIC ROUTES
        ========================== */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* =========================
            MANAGER ROUTES
        ========================== */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={["manager"]}
            />
          }
        >
          <Route
            path="/manager/dashboard"
            element={<ManagerDashboard />}
          />
          <Route
  path="/manager/projects"
  element={<Projects />}
/>

<Route
  path="/manager/projects/:id"
  element={<ProjectDetails />}
/>
  <Route
    path="/manager/team"
    element={<Team />}
  />
  <Route
  path="/manager/tasks"
  element={<ManagerTasks />}
/>

<Route
  path="/manager/settings"
  element={<ManagerSettings />}
/>
<Route
  path="/manager/tasks/:id"
  element={<ManagerTaskDetails />}
/>
        </Route>


        {/* =========================
            EMPLOYEE ROUTES
        ========================== */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={["employee"]}
            />
          }
        >
          <Route
            path="/employee/dashboard"
            element={<EmployeeDashboard />}
          />

          <Route
  path="/employee/tasks"
  element={<EmployeeTasks />}
/>
<Route
  path="/employee/projects"
  element={<EmployeeProjects />}
/>
<Route
  path="/employee/settings"
  element={<EmployeeSettings />}
/>

<Route
  path="/employee/projects/:id"
  element={<EmployeeProjectDetails />}
/>
<Route
  path="/employee/tasks/:id"
  element={<EmployeeTaskDetails />}
/>
        </Route>


        {/* =========================
            UNKNOWN ROUTES
        ========================== */}

{/* JOIN TEAM INVITATION */}

<Route
  path="/join-team/:token"
  element={<JoinTeam />}
/>


{/* UNKNOWN ROUTES */}

<Route
  path="*"
  element={
    <Navigate
      to="/login"
      replace
    />
  }
/>

      </Routes>
    </BrowserRouter>
  );
};

export default App;