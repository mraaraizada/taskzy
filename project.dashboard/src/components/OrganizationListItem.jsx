export default function OrganizationListItem({ organization, onSelect, isSelected }) {
  // Determine status badge styling based on subscription status
  const getStatusStyle = (status) => {
    const styles = {
      active: {
        background: '#E8FBF1',
        color: '#12C479',
      },
      trial: {
        background: '#EEF2FF',
        color: '#3B5BFC',
      },
      inactive: {
        background: '#F3F4F6',
        color: '#6B7280',
      },
      suspended: {
        background: '#FFF1F1',
        color: '#FF4D4F',
      },
    };
    return styles[status] || styles.inactive;
  };

  // Determine plan badge styling
  const getPlanStyle = (plan) => {
    const styles = {
      Basic: {
        background: '#F3F4F6',
        color: '#6B7280',
      },
      Pro: {
        background: '#EEF2FF',
        color: '#3B5BFC',
      },
      Enterprise: {
        background: '#F3E8FF',
        color: '#7C3AED',
      },
    };
    return styles[plan] || styles.Basic;
  };

  const statusStyle = getStatusStyle(organization.subscriptionStatus);
  const planStyle = getPlanStyle(organization.subscriptionPlan);

  return (
    <div
      onClick={() => onSelect(organization)}
      style={{
        padding: '16px',
        borderRadius: 8,
        border: isSelected ? '2px solid #3B5BFC' : '1px solid var(--border-color)',
        background: isSelected ? 'rgba(59, 91, 252, 0.05)' : 'var(--bg-surface)',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        marginBottom: 8,
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = 'var(--bg-hover)';
          e.currentTarget.style.borderColor = '#3B5BFC';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = 'var(--bg-surface)';
          e.currentTarget.style.borderColor = 'var(--border-color)';
        }
      }}
    >
      {/* Organization Name */}
      <div
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: 8,
        }}
      >
        {organization.name}
      </div>

      {/* Plan and Status Badges */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
        }}
      >
        {/* Subscription Plan Badge */}
        <span
          style={{
            ...planStyle,
            fontSize: 11,
            fontWeight: 600,
            padding: '4px 8px',
            borderRadius: 6,
            textTransform: 'capitalize',
          }}
        >
          {organization.subscriptionPlan}
        </span>

        {/* Status Badge */}
        <span
          style={{
            ...statusStyle,
            fontSize: 11,
            fontWeight: 600,
            padding: '4px 8px',
            borderRadius: 6,
            textTransform: 'capitalize',
          }}
        >
          {organization.subscriptionStatus}
        </span>
      </div>
    </div>
  );
}
