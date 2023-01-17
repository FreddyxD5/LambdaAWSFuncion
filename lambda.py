import json
import os
import mercadopago

def lambda_handler(event, context):
    sdk = mercadopago.SDK(os.environ["MC_TOKEN"])
    bodyGet=event    
    
    payment_response = sdk.payment().create(bodyGet)        
    json_payment_response = json.dumps(payment_response["response"])    
   
    return {
        "statusCode": 200,
        "body":json_payment_response,
    }
