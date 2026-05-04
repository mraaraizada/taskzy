import dashboardImg from '../../dashboard.png'

export default function DashboardPreview() {
  return (
    <div
      className="mt-8 w-full max-w-5xl rounded-2xl overflow-hidden p-3 md:p-4"
      style={{
        background: 'rgba(255, 255, 255, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        boxShadow: 'var(--shadow-dashboard)',
      }}
    >
      <div className="rounded-xl overflow-hidden border border-border">
        <img
          src={dashboardImg}
          alt="Taskzy Dashboard"
          className="w-full h-auto block select-none pointer-events-none"
          draggable={false}
        />
      </div>
    </div>
  )
}
