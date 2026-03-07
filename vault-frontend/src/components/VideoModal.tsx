
interface Props {
  videoId: string;
  onClose: () => void;
}

export const VideoModal = ({ videoId, onClose }: Props) => {
  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: 'rgba(0,0,0,0.95)', display: 'flex', 
        justifyContent: 'center', alignItems: 'center', zIndex: 1000,
        padding: '10px' // Margen de seguridad para móviles
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          width: '100%', 
          maxWidth: '800px', 
          aspectRatio: '16/9', 
          backgroundColor: 'black', 
          position: 'relative',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 0 20px rgba(0,0,0,1)'
        }}
      >
        <button 
          onClick={onClose}
          style={{ 
            position: 'absolute', top: '10px', right: '10px', 
            color: 'white', background: 'rgba(0,0,0,0.6)', 
            border: 'none', borderRadius: '50%', width: '30px', height: '30px',
            fontSize: '16px', cursor: 'pointer', zIndex: 1001
          }}
        >
          ✕
        </button>

        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};