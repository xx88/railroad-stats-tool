from math import sqrt
from scipy.stats import poisson

def run_model(data, z=1.96):
    """Return point estimation, lower and upper bounds.
    Input a list of values: y1, y2, M1, M2.
    """
    data = [float(i) for i in data]
    y1, y2, M1, M2 = data
    p1 = point_estimate(y1, y2, M1, M2)
    lb, ub = confidence_interval(y1, y2, M1, M2, z)
    return (p1, lb, ub)

def point_estimate(y1, y2, M1, M2):
    """Return point estimation for ratio.
    All input values must be of float type.
    """
    return y1 * M2 / (y2 * M1)

def confidence_interval(y1, y2, M1, M2, z):
    """Return lower and upper bounds of confidence interval.
    All input values must be of float type.
    """
    z = poisson.ppf(0.95, y1 / y2, y1 + y2)
    print z
    y12 = y1 + y2
    a1 = y1 / y12 + z**2 / (2 * y12)
    a2 = z * sqrt((y1 * y2 / y12 + z**2 / (4 * y12)) / y12)
    a3 = 1 + z**2 / y12
    a4 = (a1 - a2) / a3 
    a5 = (a1 + a2) / a3 
    lb = a4 * M2 / ((1 - a4) * M1)
    ub = a5 * M2 / ((1 - a5) * M1)
    return (lb, ub)

def main():
    print 
    data = [
        (19, 29, 1372, 2499)        
    ]
    for d in data:
        print run_model(d)

if __name__ == '__main__':
    main()
