from src.auth.schemas import PublicTransaction

def generate_report(data: list[PublicTransaction]):
    total_spent=0
    mean_mensal=0
    result={}
    for transaction in data:
        total_spent += int(transaction.value)

    mean_mensal = round((total_spent / len(data)), 2)

    return{
        'total_spent': total_spent,
        'mean_mensal': mean_mensal
    }