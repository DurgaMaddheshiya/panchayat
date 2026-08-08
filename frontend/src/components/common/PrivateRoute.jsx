import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children, roles }) => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!user) {
    // Agar user pehle se kisi protected page pe tha (e.g. refresh) to login pe bhejo
    // Naya visit ya logout ke baad to landing page pe bhejo
    const from = location.state?.from?.pathname;
    return <Navigate to={from ? '/login' : '/'} state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PrivateRoute;
