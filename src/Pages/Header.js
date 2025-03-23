import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import axios from 'axios';
import { FiLogOut, FiUser, FiSettings, FiHome, FiCreditCard, FiActivity, FiRepeat, FiDownload, FiSend  } from 'react-icons/fi';

const Header = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Gestion du scroll pour modifier le header
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const token = localStorage.getItem('token');

  // Récupération des données du profil via Axios
  useEffect(() => {
    axios
      .get('http://localhost:5000/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      .then(response => {
        setProfile(response.data);
      })
      .catch(error => {
        console.error('Erreur lors de la récupération du profil:', error);
      });
  }, [token]);

  // Ajout d'icônes dans les éléments de navigation
  const navItems = [
    { path: '/dashboard', label: 'Tableau de bord', icon: <FiHome /> },
    { path: '/payment', label: 'Payment', icon: <FiCreditCard /> },
    { path: '/transfer', label: 'Transfert', icon: <FiSend /> },
    { path: '/transactions', label: 'Transactions', icon: <FiActivity /> },
    { path: '/deposit-withdraw', label: 'Dépôt & Retrait', icon: <FiDownload /> },
    { path: '/exchange', label: 'Échange', icon: <FiRepeat /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <StyledHeader $isScrolled={isScrolled}>
      <LogoContainer>
        <Logo
          href="/"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <GradientSpan>Your</GradientSpan>Bank
        </Logo>
      </LogoContainer>

      <Nav>
        <NavList>
          {navItems.map((item, index) => (
            <NavItem 
              key={item.path}
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(-1)}
            >
              <NavLink to={item.path}>
                <IconWrapper>{item.icon}</IconWrapper>
                {item.label}
                {hoveredIndex === index && (
                  <HoverLine
                    layoutId="hoverLine"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  />
                )}
              </NavLink>
            </NavItem>
          ))}
        </NavList>
      </Nav>

      <ProfileContainer>
        <ProfileButton
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Menu utilisateur"
        >
          {profile && profile.profile_photo ? (
            <ProfileImage 
              src={`http://localhost:5000/${profile.profile_photo}`} 
              alt={profile.firstname} 
            />
          ) : (
            <DefaultProfile>
              <span>{profile ? profile.firstname.charAt(0) : 'U'}</span>
            </DefaultProfile>
          )}
        </ProfileButton>

        <AnimatePresence>
          {isMenuOpen && (
            <DropdownMenu
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <UserInfo>
                <UserName>
                  {profile ? `${profile.firstname} ${profile.lastname}` : 'Utilisateur'}
                </UserName>
                <UserEmail>
                  {profile ? profile.email : ''}
                </UserEmail>
              </UserInfo>
              
              <MenuLink to="/profile">
                <FiUser />
                <span>Mon Profil</span>
              </MenuLink>
              
              <MenuLink to="/settings">
                <FiSettings />
                <span>Paramètres</span>
              </MenuLink>
              
              <LogoutButton
                onClick={handleLogout}
                whileHover={{ x: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <FiLogOut />
                <span>Déconnexion</span>
              </LogoutButton>
            </DropdownMenu>
          )}
        </AnimatePresence>
      </ProfileContainer>

      <HeaderShine $isScrolled={isScrolled} />
    </StyledHeader>
  );
};

// Animations
const headerVariants = {
  hidden: { y: -100 },
  visible: { y: 0 }
};

const StyledHeader = styled(motion.header).attrs(props => ({
  initial: 'hidden',
  animate: 'visible',
  variants: headerVariants,
  transition: { type: 'spring', damping: 10 }
}))`
  position: fixed;
  top: 0;
  width: 100%;
  display: flex;
  align-items: center;
  padding: ${props => props.$isScrolled ? '1rem 2.5rem' : '2rem 2.5rem'};
  background: ${props => props.$isScrolled ? 'rgba(255, 255, 255, 0.98)' : '#ffffff'};
  backdrop-filter: blur(10px);
  box-shadow: ${props => props.$isScrolled 
    ? '0 4px 20px rgba(0, 0, 0, 0.08)' 
    : 'none'};
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  z-index: 1000;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const LogoContainer = styled.div`
  flex: 1;
  min-width: 120px;
`;

const Logo = styled(motion.a)`
  font-size: 1.75rem;
  font-weight: 700;
  text-decoration: none;
  background: linear-gradient(90deg, #003087 0%, #009cde 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  position: relative;
  transition: all 0.3s ease;

  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, #003087 0%, #009cde 100%);
    transition: width 0.4s ease;
  }

  &:hover::after {
    width: 100%;
  }
`;

const GradientSpan = styled.span`
  color: #003087;
`;

const Nav = styled.nav`
  flex: 5;
  margin: 0 2rem;

  @media (max-width: 1024px) {
    display: none;
  }
`;

const NavList = styled.ul`
  display: flex;
  justify-content: center;
  gap: 2.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const NavItem = styled(motion.li)`
  position: relative;
`;

const IconWrapper = styled.span`
  margin-right: 0.5rem;
  display: inline-flex;
  vertical-align: middle;
`;

const NavLink = styled(Link)`
  color: #2d2d2d;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  position: relative;
  padding: 0.5rem 0;
  transition: color 0.3s ease;

  &:hover {
    color: #003087;
  }
`;

const HoverLine = styled(motion.div)`
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 100%;
  height: 2px;
  background: #003087;
  transform-origin: left center;
`;

const ProfileContainer = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  justify-content: center;
  min-width: 60px;
  overflow: visible;
`;

const ProfileButton = styled(motion.button)`
  border: none;
  background: none;
  cursor: pointer;
  padding: 0;
  border-radius: 50%;
  overflow: hidden;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid transparent;
  transition: all 0.3s ease;

  &:hover {
    border-color: #00308720;
    transform: scale(1.05);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px #00308740;
  }
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
  transition: transform 0.3s ease;
  min-width: 100%;
  min-height: 100%;
  background: #f0f0f0;
`;

const DefaultProfile = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #003087, #009cde);
  color: white;
  font-weight: 600;
  border-radius: 50%;
  font-size: 1.2rem;
`;

const DropdownMenu = styled(motion.div)`
  position: absolute;
  top: 65px;
  right: 45px;
  transform: translateX(-100%);
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  min-width: 240px;
  z-index: 1100;
  border: 1px solid #f0f0f0;
`;

const UserInfo = styled.div`
  padding: 0.5rem 1rem;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid #f0f0f0;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #2d2d2d;
`;

const UserEmail = styled.div`
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.25rem;
`;

const MenuLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  color: #2d2d2d;
  text-decoration: none;
  font-size: 0.9rem;
  border-radius: 8px;
  transition: all 0.2s ease;

  svg {
    font-size: 1.1rem;
    color: #666;
  }

  &:hover {
    background: #f5f6f7;
    color: #003087;

    svg {
      color: #003087;
    }
  }
`;

const LogoutButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  color: #e74c3c;
  font-size: 0.9rem;
  cursor: pointer;
  border-radius: 8px;
  margin-top: 0.5rem;
  transition: all 0.2s ease;

  svg {
    font-size: 1.1rem;
  }

  &:hover {
    background: #fde8e6;
  }
`;

const HeaderShine = styled.div`
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: ${props => props.$isScrolled ? 'none' : 'left 1s ease-in-out'};
  animation: ${props => !props.$isScrolled && 'shine 6s infinite'};

  @keyframes shine {
    0% { left: -100%; }
    20% { left: 100%; }
    100% { left: 100%; }
  }
`;

export default Header;
