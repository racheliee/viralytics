#!/usr/bin/env python
# coding: utf-8

# In[ ]:


import pandas as pd
import numpy as np

df=pd.read_csv('',encoding='utf-8-sig')

#df = pd.read_csv('C:\\Users\\장재요원지\\Downloads\\merged_dataset_post_with_images_with_captions.csv', encoding='utf-8')

def count_hashtags(x):
    if pd.isna(x):
        return 0
    # 빈 문자열 처리
    x = x.strip()
    if not x:
        return 0
    return len([tag for tag in x.split(',') if tag.strip()])

df['hashtag_count'] = df['hashtags'].apply(count_hashtags)
df['mention_count'] = df['mentions'].apply(count_hashtags)
df=df.drop(columns=['mentions','hashtags'])
df=df[df['caption'].isna()==False]

df_captionlen=df['caption'].apply(lambda x: len(x))
df['captionlen']=df_captionlen

from datetime import datetime

df["day_of_week"] = df["timestamp"].apply(lambda x: datetime.strptime(x, "%Y-%m-%dT%H:%M:%S.%fZ").strftime("%A"))
df["hour"] = df["timestamp"].apply(lambda x: int(datetime.strptime(x, "%Y-%m-%dT%H:%M:%S.%fZ").strftime("%H")))
df["day_of_year"] = df["timestamp"].apply(lambda x: datetime.strptime(x, "%Y-%m-%dT%H:%M:%S.%fZ").strftime("%Y"))


df2=df.drop(columns=['caption','timestamp','owner_fullName','owner_verified','owner_biography','isSponsored','images'])

df2['day_of_year']=df2['day_of_year'].astype(int)
df2 = pd.get_dummies(
    df2,
    columns=['day_of_week', 'owner_businessCategoryName'],
    dtype=int  # int로 지정
)
df2=df2[df2['owner_id'].isna()==False]

df2 = df2[df2['likesCount'] >= 0]
# owner_id별 likesCount 평균
df2['owner_avg_likesCount'] = df2.groupby('owner_id')['likesCount'].transform('mean')

# owner_id별 likesCount 중앙값
df2['owner_median_likesCount'] = df2.groupby('owner_id')['likesCount'].transform('median')
df2['owner_median_commentCount'] = df2.groupby('owner_id')['commentsCount'].transform('median')
df2['owner_var_likesCount'] = df2.groupby('owner_id')['likesCount'].transform('var')
# 표준편차 컬럼 추가 (루트 분산)
df2['owner_std_likesCount'] = np.sqrt(df2['owner_var_likesCount'])
df2['mean_impress']=df2['owner_avg_likesCount']/df2['owner_followersCount']

# In[ ]:


# 최종 좋아요 예측하기
y = df2['likesCount'] # y는 likesCount와 commentsCount

x = df2.drop(columns=['owner_businessCategoryName_None,Health/beauty','mean_impress','owner_median_commentCount','owner_id','likesCount', 'commentsCount','impression'])  # 나머지 열은 x

counts = x['owner_followersCount'].value_counts()
print(counts)
x = x[x['owner_followersCount'].isin(counts[counts > 1].index)]
y = y[x.index]
x=x.drop(columns="image_captions")

# In[ ]:


#사용하는 피쳐!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
selected_features=['owner_followersCount', 'day_of_week_Wednesday','owner_postsCount', 'hashtag_count',
       'day_of_year', 'owner_avg_likesCount','owner_median_likesCount', 'owner_std_likesCount']

# In[ ]:


#xgb
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score,mean_absolute_percentage_error
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score,mean_absolute_percentage_error
import xgboost as xgb
import pyswarms as ps
import matplotlib.pyplot as plt
x_train, x_test, y_train, y_test = train_test_split(
    x, y, test_size=0.3, random_state=102
)
x_train_sel1 = x_train.loc[:, selected_features]
x_test_sel1 = x_test.loc[:, selected_features]
# 3. MinMax 스케일링
scaler = MinMaxScaler()
x_train_sel = scaler.fit_transform(x_train_sel1)
x_test_sel = scaler.transform(x_test_sel1)

scaler2 = MinMaxScaler()
x_train_scaled = scaler2.fit_transform(x_train)
x_test_scaled = scaler2.transform(x_test)

x_t=x_test
model = xgb.XGBRegressor()
model0 = xgb.XGBRegressor()
model0.fit(x_train_scaled, y_train)
model.fit(x_train_sel, y_train)

y_pred0 = model0.predict(x_test_scaled)

y_pred = model.predict(x_test_sel)


print("피쳐셀렉 안했을때")
mse0 = mean_squared_error(y_test, y_pred0)
mae0 = mean_absolute_error(y_test, y_pred0)
r20 = r2_score(y_test, y_pred0)
print(f"Mean Squared Error: {mse0:.8f}")
print(f"Mean Absolute Error: {mae0:.5f}")
print(f"R² Score: {r20:.2f}")

mape0=mean_absolute_percentage_error(y_test, y_pred0)
print(f"mean_absolute_percentage_erro: {mape0:.2f}")
owner_std = np.sqrt(x_t['owner_var_likesCount'].values)  # 표준편차로 변환
nmae0 = np.mean(np.abs(y_test - y_pred0) / owner_std)
print(f"Normalized MAE (by user group std): {nmae0:.5f}")
print("-----------------------------------")
print("피쳐셀렉 햇을때")
mse = mean_squared_error(y_test, y_pred)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)
print(f"Mean Squared Error: {mse:.8f}")
print(f"Mean Absolute Error: {mae:.5f}")
print(f"R² Score: {r2:.2f}")
from sklearn.metrics import mean_absolute_percentage_error
mape=mean_absolute_percentage_error(y_test, y_pred)
print(f"mean_absolute_percentage_erro: {mape:.2f}")
owner_std = np.sqrt(x_t['owner_var_likesCount'].values)  # 표준편차로 변환

# 분산이 0인 경우 1로 대체(0으로 나누는 오류 방지)
owner_std[owner_std == 0] = 1

# 정규화 MAE (NMAE)
nmae = np.mean(np.abs(y_test - y_pred) / owner_std)
print(f"Normalized MAE (by user group std): {nmae:.5f}")

#중앙값 mape

def medape(y_test,y_pred):
    mask=y_test!=0
    ape=np.abs((y_test[mask]-y_pred[mask])/y_test[mask])
    return np.median(ape)

print(f"med_absolute_percentage_erro: {medape(y_test,y_pred):.2f}")
