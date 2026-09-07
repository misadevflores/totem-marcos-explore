import React, { useState } from 'react';
import { Category } from '../types';
import { DEFAULT_CATEGORY_ICONS } from '../data/mockCatalog';
import {
  Droplets,
  Wrench,
  Boxes,
  Filter,
  FlaskConical,
  Zap,
  Settings,
  Activity,
  Shield,
  Layers,
  Gauge,
  Cpu,
  Cog,
  Anchor,
  Hammer,
  HardHat,
  Compass,
  FileText,
  BookOpen,
  Truck,
  Disc,
  Flame,
  Package,
  Factory
} from 'lucide-react';

interface CategoryIconProps {
  category?: Partial<Category>;
  iconUrl?: string;
  iconName?: string;
  title?: string;
  className?: string;
  vectorClassName?: string;
  alt?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  category,
  iconUrl,
  iconName,
  title,
  className = 'w-full h-full',
  vectorClassName,
  alt
}) => {
  const [imgError, setImgError] = useState(false);

  const fallbackFromCatalog = category?.id ? DEFAULT_CATEGORY_ICONS[category.id] : undefined;
  const effectiveIconUrl = iconUrl || category?.iconUrl || fallbackFromCatalog;
  const effectiveIconName = iconName || category?.iconName || 'BookOpen';
  const effectiveAlt = alt || title || category?.title || 'Icono de categoría';

  // Render Vector fallback
  const renderVectorIcon = (name: string, cls: string) => {
    switch (name) {
      case 'Droplets':
        return <Droplets className={cls} />;
      case 'Wrench':
        return <Wrench className={cls} />;
      case 'Boxes':
        return <Boxes className={cls} />;
      case 'Filter':
        return <Filter className={cls} />;
      case 'FlaskConical':
        return <FlaskConical className={cls} />;
      case 'Zap':
        return <Zap className={cls} />;
      case 'Settings':
        return <Settings className={cls} />;
      case 'Activity':
        return <Activity className={cls} />;
      case 'Shield':
        return <Shield className={cls} />;
      case 'Layers':
        return <Layers className={cls} />;
      case 'Gauge':
        return <Gauge className={cls} />;
      case 'Cpu':
        return <Cpu className={cls} />;
      case 'Cog':
        return <Cog className={cls} />;
      case 'Anchor':
        return <Anchor className={cls} />;
      case 'Hammer':
        return <Hammer className={cls} />;
      case 'HardHat':
        return <HardHat className={cls} />;
      case 'Compass':
        return <Compass className={cls} />;
      case 'FileText':
        return <FileText className={cls} />;
      case 'Truck':
        return <Truck className={cls} />;
      case 'Disc':
        return <Disc className={cls} />;
      case 'Flame':
        return <Flame className={cls} />;
      case 'Package':
        return <Package className={cls} />;
      case 'Factory':
        return <Factory className={cls} />;
      case 'BookOpen':
      default:
        return <BookOpen className={cls} />;
    }
  };

  if (effectiveIconUrl && !imgError) {
    return (
      <img
        src={effectiveIconUrl}
        alt={effectiveAlt}
        onError={() => setImgError(true)}
        className={`object-contain select-none pointer-events-none ${className}`}
        loading="lazy"
      />
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {renderVectorIcon(effectiveIconName, vectorClassName || 'w-full h-full')}
    </div>
  );
};
