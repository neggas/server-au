
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Scale, Shield, User, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Header = ({ currentView, isAuthenticated, user, onNavigate, onLogout, onBackToHome, onBackToDashboard }) => {
  
  const getBackButton = () => {
    if (!isAuthenticated || currentView === 'dashboard' || currentView === 'home') return null;
    
    const commonClasses = "flex items-center space-x-2 text-text-secondary hover:text-primary-blue transition-colors";
    
    if (currentView === 'analysis' || currentView === 'profile' || currentView === 'submission') {
      return (
        <button onClick={onBackToDashboard} className={commonClasses}>
          <ArrowLeft className="w-5 h-5" />
          <span>Tableau de bord</span>
        </button>
      );
    }

    return (
      <button onClick={onBackToHome} className={commonClasses}>
        <ArrowLeft className="w-5 h-5" />
        <span>Accueil</span>
      </button>
    );
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark-bg/80 backdrop-blur-lg border-b border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <motion.div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'home')}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center space-x-2">
              <Scale className="w-8 h-8 text-primary-blue" />
              <span className="text-2xl font-bold text-text-primary font-serif">PAVIA</span>
            </div>
          </motion.div>

          <div className="flex items-center space-x-6">
            {getBackButton()}
            
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border-2 border-primary-blue">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-dark-card border-dark-border text-text-primary" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-text-secondary">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-dark-border" />
                  <DropdownMenuItem onClick={() => onNavigate('dashboard')} className="cursor-pointer hover:bg-dark-border/50">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Tableau de bord</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onNavigate('profile')} className="cursor-pointer hover:bg-dark-border/50">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profil</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-dark-border" />
                  <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-red-400 hover:!text-red-400 hover:!bg-red-500/20">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Déconnexion</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => onNavigate('auth')} className="btn-primary">
                Connexion
              </Button>
            )}
            
            <motion.div 
              className="hidden sm:flex items-center space-x-2 text-text-secondary text-sm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Shield className="w-4 h-4 text-success-green" />
              <span className="hidden sm:inline">Conforme droit québécois</span>
            </motion.div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
