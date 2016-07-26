from math import sqrt, exp
from scipy.stats import norm, f


def run_model(data_list, alpha=0.05):
    """Return point estimation, lower and upper bounds.
    Input a list of values: y1, y2, M1, M2.
    """
    if type(data_list[0]) is not list and type(data_list[0]) is not tuple:
        data_list = [data_list]
    intervals = {
        'wald': wald_interval,
        'wilson': wilson_interval,
        'approx2': approx2_interval,
        'exact': exact_interval,
    }
    results = []
    for data in data_list:
        index = data[0]
        data = [float(i) for i in data[1:]]
        y1, y2, M1, M2 = data
        result = {}
        for func in intervals:
            pe = point_estimate(y1, y2, M1, M2)
            lb, ub = intervals[func](y1, y2, M1, M2, alpha)
            result[func] = (index, pe, lb, ub)
        results.append(result)
    return results

def point_estimate(y1, y2, M1, M2):
    """Return point estimation for ratio.
    Note: All input values must be of float type.
    """
    return y1 * M2 / (y2 * M1)

def wald_interval(y1, y2, M1, M2, alpha):
    """Return Wald and likelihood based confidence interval.
    Note: All input values must be of float type.
    """
    z = norm.ppf(1.0 - alpha / 2)
    lb = y1 / y2 * exp(-z * sqrt(1 / y1 + 1 / y2)) * M2 / M1
    ub = y1 / y2 * exp(z * sqrt(1 / y1 + 1 / y2)) * M2 / M1
    return (lb, ub)

def wilson_interval(y1, y2, M1, M2, alpha):
    """Return lower and upper bounds of Wilson interval.
    Note: All input values must be of float type.
    """
    z = norm.ppf(1.0 - alpha / 2)
    y12 = y1 + y2
    a1 = y1 / y12 + z**2 / (2 * y12)
    a2 = z * sqrt((y1 * y2 / y12**2 + z**2 / (4 * y12)) / y12)
    a3 = 1 + z**2 / y12
    a4 = (a1 - a2) / a3 
    a5 = (a1 + a2) / a3 
    lb = a4 * M2 / ((1 - a4) * M1)
    ub = a5 * M2 / ((1 - a5) * M1)
    return (lb, ub)

def approx2_interval(y1, y2, M1, M2, alpha):
    """Return confidence interval approximate to 2.  
    Note: All input values must be of float type.  """
    z = norm.ppf(1.0 - alpha / 2)
    n = y1 + y2 + 4
    pi_hat = (y1 + 2) / n
    lb_pi = pi_hat - z * sqrt(pi_hat * (1 - pi_hat) / n)
    ub_pi = pi_hat + z * sqrt(pi_hat * (1 - pi_hat) / n)
    lb = lb_pi / (1 - lb_pi) * M2 / M1;
    ub = ub_pi / (1 - ub_pi) * M2 / M1;
    return (lb, ub)

def exact_interval(y1, y2, M1, M2, alpha):
    """Return exact bound.
    Note: All input values must be of float type.
    """
    n = y1 + y2
    df11 = 2 * (n - y1 + 1)
    df12 = 2 * y1
    df21 = 2 * (y1 + 1)
    df22 = 2 * (n - y1)
    f_alpha_over_two = f.ppf(1 - alpha / 2, df11, df12)
    lb_pi = y1 / (y1 + (n - y1 + 1) * f_alpha_over_two)
    ub_pi = 1 - (n - y1) / (n - y1 + (y1 + 1) * f_alpha_over_two)
    lb = lb_pi / (1 - lb_pi) * M2 / M1
    ub = ub_pi / (1 - ub_pi) * M2 / M1
    return (lb, ub)

def main():
    data = [
        (19, 29, 1372, 2499),
        (98, 122, 6595223, 13688136)        
    ]
    print run_model(data)

if __name__ == '__main__':
    main()
