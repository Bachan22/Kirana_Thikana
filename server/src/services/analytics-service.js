function normalize(value, max) {
  return Math.min(value / max, 1);
}

export function scoreArea(area) {
  const orderScore = normalize(area.totalOrders, 2200) * 30;
  const riderScore = normalize(area.activeRiders, 80) * 18;
  const demandScore = normalize(area.demandIndex, 100) * 20;
  const serviceGapScore = normalize(area.serviceGap, 100) * 18;
  const deliverySpeedScore = (1 - normalize(area.avgDeliveryMins, 35)) * 8;
  const competitionPenalty = normalize(area.competitionIndex, 100) * 10;
  const existingStorePenalty = area.stores.length > 1 ? 6 : area.stores.length === 1 ? 2 : 0;

  return Math.round(orderScore + riderScore + demandScore + serviceGapScore + deliverySpeedScore - competitionPenalty - existingStorePenalty);
}

export function buildAreaSnapshot(area) {
  const score = scoreArea(area);
  return {
    ...area,
    launchScore: score,
    orderPerRider: Number((area.totalOrders / area.activeRiders).toFixed(1)),
    riderPressure: Math.round((area.totalOrders / area.activeRiders) * 10) / 10
  };
}

export function buildCityRanking(areas) {
  return areas.map(buildAreaSnapshot).sort((left, right) => right.launchScore - left.launchScore);
}

export function buildInsights(area) {
  return [
    {
      title: "Demand pulse",
      value: `${area.demandIndex}/100`,
      detail: "Demand index built from area order strength and repeat activity."
    },
    {
      title: "Order load",
      value: `${area.totalOrders.toLocaleString()} / month`,
      detail: `${area.orderPerRider} orders per rider across active supply.`
    },
    {
      title: "Coverage gap",
      value: `${area.serviceGap}/100`,
      detail: "Higher gap means more room for a fresh Black Store launch."
    },
    {
      title: "Delivery speed",
      value: `${area.avgDeliveryMins} mins`,
      detail: "Current fulfillment speed in the surrounding micro-market."
    }
  ];
}

export function buildRecommendation(area) {
  return {
    headline: `Launch the next store in ${area.name}`,
    reasons: [
      `${area.totalOrders.toLocaleString()} monthly orders suggest strong base demand.`,
      `${area.activeRiders} active riders provide enough delivery capacity for fast rollout.`,
      `${area.nearbyShops} nearby shops validate customer activity in the area.`,
      `${area.serviceGap}/100 service gap indicates meaningful whitespace.`,
      area.stores.length === 0
        ? "No current Black Store presence makes this a pure expansion opportunity."
        : "Existing nearby presence can still support a focused hub extension."
    ]
  };
}
