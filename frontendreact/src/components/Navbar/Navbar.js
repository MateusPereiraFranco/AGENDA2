//react
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Para redirecionar o usuário

//API
import { API_URL } from "../../services/apiConfig"; // Importe a URL da API

//Icons
import piratinha from "../../assets/piratinha.png";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import { HiOutlineBars3 } from "react-icons/hi2";
import LogoutIcon from "@mui/icons-material/Logout"; // Ícone para o logout
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import KeyIcon from '@mui/icons-material/Key';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext"; // Importe o hook useAuth
import { flushSync } from 'react-dom';

const Navbar = () => {
  const [openMenu, setOpenMenu] = useState(false);
  const { isAuthenticated, logout, setIsAuthenticated, user, setUser } = useAuth(); // Use o contexto de autenticação
  const navigate = useNavigate();

  const handleNavigateToChangePassword = () => {
    navigate("/atualizar-senha");
  };

  // Função para fazer logout
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };


  // Opções do menu
  const menuOptions = [
    {
      text: "Home",
      icon: <HomeIcon />,
      path: "/",
    },
    {
      text: "About",
      icon: <InfoIcon />,
      path: "/about",
    },
    {
      text: "Contact",
      icon: <PhoneRoundedIcon />,
      path: "/contact",
    },
  ];

  return (
    <nav>
      <div className="nav-logo-container">
        <img src={piratinha} alt="Logo" />
      </div>
      <div className="navbar-links-container">
        {menuOptions.map((item) => (
          <a key={item.text} href={item.path || "#"} onClick={item.onClick}>
            {item.text}
          </a>
        ))}
        {/* Botão de logout ao lado do Cart */}
        {isAuthenticated && (
          <>
            <a onClick={handleNavigateToChangePassword} style={{ cursor: "pointer" }}>
              Trocar Senha
            </a>

            <button className="logout-button" onClick={handleLogout}>
              <LogoutIcon className="logout_icon" />
              <span>Logout</span>
            </button>

          </>
        )}
      </div>
      <div className="navbar-menu-container">
        <HiOutlineBars3 onClick={() => setOpenMenu(true)} />
      </div>
      <Drawer open={openMenu} onClose={() => setOpenMenu(false)} anchor="right">
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={() => setOpenMenu(false)}
          onKeyDown={() => setOpenMenu(false)}
        >
          <List>
            {menuOptions.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton onClick={item.onClick}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
            {/* Adiciona o botão de logout no menu lateral */}
            {isAuthenticated && (
              <>
                <ListItem disablePadding>
                  <ListItemButton onClick={handleNavigateToChangePassword}>
                    <ListItemIcon>
                      <KeyIcon /> {/* Ou outro ícone como KeyRoundedIcon */}
                    </ListItemIcon>
                    <ListItemText primary="Trocar Senha" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={handleLogout}>
                    <ListItemIcon>
                      <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                  </ListItemButton>
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </nav>
  );
};

export default Navbar;
