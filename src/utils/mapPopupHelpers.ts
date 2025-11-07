import type { PopupProps } from '@/types/map.types';
import { sanitizeStoreName } from './mapHelpers';

/**
 * Generate HTML content for store popup
 */
export const createPopupHTML = (props: PopupProps): string => {
  const { name, address, notes, coordinates, isFavorite } = props;
  const sanitizedName = sanitizeStoreName(name);

  return `
    <div style="
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      padding: 0;
      min-width: 280px;
      max-width: 320px;
    ">
      <div style="
        background: linear-gradient(135deg, #B7A3E3 0%, #9575CD 100%);
        padding: 16px;
        border-radius: 12px 12px 0 0;
      ">
        <h3 style="
          margin: 0;
          color: white;
          font-size: 18px;
          font-weight: 600;
          line-height: 1.4;
          width: 90%;
        ">${name}</h3>
      </div>
      
      <div style="padding: 12px;">
        <div style="
          display: flex;
          align-items: start;
          margin-bottom: 12px;
          gap: 8px;
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" style="flex-shrink: 0; margin-top: 2px;">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <p style="
            margin: 0;
            color: #333;
            font-size: 14px;
            line-height: 1.5;
          ">${address}</p>
        </div>
        
        <div style="
          display: flex;
          align-items: start;
          margin-bottom: 16px;
          gap: 8px;
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" style="flex-shrink: 0; margin-top: 2px;">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 16v-4M12 8h.01"></path>
          </svg>
          <p style="
            margin: 0;
            color: #666;
            font-size: 13px;
            line-height: 1.5;
          ">${notes}</p>
        </div>
        
        <div style="
          display: flex;
          gap: 8px;
          margin-top: 12px;
        ">
          <button 
            id="favorite-btn-${sanitizedName}"
            style="
              flex: 1;
              padding: 10px 16px;
              background: ${isFavorite ? '#B7A3E3' : 'white'};
              color: ${isFavorite ? 'white' : '#B7A3E3'};
              border: 2px solid #B7A3E3;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 6px;
            "
            onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 8px rgba(183, 163, 227, 0.3)';"
            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="${isFavorite ? 'white' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            ${isFavorite ? 'Saved' : 'Save'}
          </button>
          
          <button 
            id="directions-btn-${sanitizedName}"
            data-lng="${coordinates[0]}"
            data-lat="${coordinates[1]}"
            style="
              flex: 1;
              padding: 10px 16px;
              background: linear-gradient(135deg, #B7A3E3 0%, #9575CD 100%);
              color: white;
              border: none;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 6px;
            "
            onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(183, 163, 227, 0.4)';"
            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"></path>
              <path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z"></path>
            </svg>
            Directions
          </button>
        </div>
      </div>
    </div>
  `;
};

/**
 * Generate HTML for route information display
 */
export const createRouteInfoHTML = (distanceKm: string, durationMin: number): string => {
  return `
    <div style="
      margin-top: 12px;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 6px;
      border-left: 4px solid #B7A3E3;
    ">
      <div style="
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        gap: 16px;
      ">
        <span style="color: #666; font-size: 13px;">
          <strong>Distance:</strong> ${distanceKm} km
        </span>
        <span style="color: #666; font-size: 13px;">
          <strong>Time:</strong> ${durationMin} min
        </span>
      </div>
      <button 
        id="clear-route-btn"
        style="
          width: 100%;
          padding: 8px;
          background: white;
          color: #B7A3E3;
          border: 1px solid #B7A3E3;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        "
        onmouseover="this.style.background='#B7A3E3'; this.style.color='white';"
        onmouseout="this.style.background='white'; this.style.color='#B7A3E3';"
      >
        Clear Route
      </button>
    </div>
  `;
};

