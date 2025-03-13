//react
import React, { useState, useEffect } from 'react';

// routerdom
import { useNavigate } from 'react-router-dom'; // Para redirecionar o usuário

//Api
import { API_URL } from '../../services/apiConfig';

//Icons
import { BsCart2 } from "react-icons/bs";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import { HiOutlineBars3 } from "react-icons/hi2";
import LogoutIcon from "@mui/icons-material/Logout"; // Ícone para o logout
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import CommentRoundedIcon from "@mui/icons-material/CommentRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";

const Navbar = () => {
    const [openMenu, setOpenMenu] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Estado de autenticação
    const navigate = useNavigate();

    // Verifica se o usuário está autenticado ao carregar o componente
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Verifica se o cookie de autenticação existe
                const response = await fetch(`${API_URL}/check-auth`, {
                    credentials: 'include', // Inclui cookies na requisição
                });
                const data = await response.json();
                if (data.authenticated) {
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error('Erro ao verificar autenticação:', error);
            }
        };

        checkAuth();
    }, []);

    // Função para fazer logout
    const handleLogout = async () => {
        try {
            const response = await fetch(`${API_URL}/logout`, {
                method: 'POST',
                credentials: 'include', // Inclui cookies na requisição
            });
            if (response.ok) {
                setIsAuthenticated(false); // Atualiza o estado de autenticação
                navigate('/'); // Redireciona para a página de login
            } else {
                console.error('Erro ao fazer logout:', response.statusText);
            }
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    };

    // Opções do menu
    const menuOptions = [
        {
            text: "Home",
            icon: <HomeIcon />,
            path: "/"
        },
        {
            text: "About",
            icon: <InfoIcon />,
            path: "/about"
        },
        {
            text: "Testimonials",
            icon: <CommentRoundedIcon />,
            path: "/testimonials"
        },
        // Substitui "Contact" por "Logout" se o usuário estiver autenticado
        isAuthenticated
            ? {
                text: "Logout",
                icon: <LogoutIcon />,
                onClick: handleLogout // Ação de logout
            }
            : {
                text: "Contact",
                icon: <PhoneRoundedIcon />,
                path: "/contact"
            },
        {
            text: "Cart",
            icon: <ShoppingCartRoundedIcon />,
            path: "/cart"
        }
    ];

    return (
        <nav>
            <div className='nav-logo-container'>
                <img src={null} alt="Logo" />
            </div>
            <div className='navbar-links-container'>
                {menuOptions.map((item) => (
                    <a key={item.text} href={item.path || "#"} onClick={item.onClick}>
                        {item.text}
                    </a>
                ))}
                <button className='primary-button'>Booking Now</button>
            </div>
            <div className='navbar-menu-container'>
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
                    </List>
                </Box>
            </Drawer>
        </nav>
    );
};

export default Navbar;