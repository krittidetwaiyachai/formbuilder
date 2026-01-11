export default function Loader({ className = '' }: { className?: string }) {
  return (
    <div className={`relative inline-block ${className}`} style={{ width: '48px', height: '48px' }}>
      <div 
        style={{
          transform: 'rotateZ(45deg)',
          perspective: '1000px',
          borderRadius: '50%',
          width: '48px',
          height: '48px',
          color: '#000',
          position: 'relative',
        }}
      >
        <style>{`
          @keyframes loader-spin {
            0%, 100% { box-shadow: .2em 0px 0 0px currentcolor; }
            12% { box-shadow: .2em .2em 0 0 currentcolor; }
            25% { box-shadow: 0 .2em 0 0px currentcolor; }
            37% { box-shadow: -.2em .2em 0 0 currentcolor; }
            50% { box-shadow: -.2em 0 0 0 currentcolor; }
            62% { box-shadow: -.2em -.2em 0 0 currentcolor; }
            75% { box-shadow: 0px -.2em 0 0 currentcolor; }
            87% { box-shadow: .2em -.2em 0 0 currentcolor; }
          }
        `}</style>
        <div style={{
          content: '',
          display: 'block',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          transform: 'rotateX(70deg)',
          animation: '1s loader-spin linear infinite',
        }} />
        <div style={{
          content: '',
          display: 'block',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          color: '#6366f1',
          transform: 'rotateY(70deg)',
          animation: '1s loader-spin linear infinite',
          animationDelay: '.4s',
        }} />
      </div>
    </div>
  );
}
