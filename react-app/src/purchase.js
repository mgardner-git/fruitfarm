import React from 'react';
import axios from 'axios';
import {useRef, useState, useEffect, useContext } from 'react';
import { ProtectedRoute  } from './protectedRoute';
const Purchase = () => {

  return (
      <ProtectedRoute roles="customer manager">
        <div className = "container">purchase</div>
      </ProtectedRoute>
  )
}

export default Purchase;